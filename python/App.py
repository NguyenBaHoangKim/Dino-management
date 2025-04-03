import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import datetime
import json
import time
app = Flask(__name__)
CORS(app)

# ESP32 IP address
ESP32_IP = 'http://192.168.102.10/led_command'  # Ensure this IP is correct

# MongoDB setup
client = MongoClient('mongodb+srv://baloctq:beTyD55wbFImHkoC@management-block.0dthd.mongodb.net/')
db = client['demo_v1']
collection = db['files']

# Global variables
last_led_command = "none"
last_high_sent_time = None
COOLDOWN_PERIOD = 1  # Time in seconds

def send_command_to_esp32(command):
    """Send LED command to ESP32."""
    payload = {'command': command}
    payload_json = json.dumps(payload, separators=(',', ':'))  # Compact JSON
    print(f"DEBUG: Sending the following JSON to ESP32: {payload_json}")  # Debug print
    
    try:
        headers = {'Content-Type': 'application/json'}
        response = requests.post(ESP32_IP, data=payload_json, headers=headers)
        
        print(f"DEBUG: Response from ESP32 status code: {response.status_code}")
        print(f"DEBUG: Response body from ESP32: {response.text}")
        
        if response.status_code == 200:
            print("DEBUG: Command sent to ESP32 successfully")
        else:
            print(f"DEBUG: Failed to send command to ESP32: {response.status_code} - {response.text}")
        
        return response.status_code
    
    except Exception as e:
        print(f"DEBUG: Error sending command to ESP32: {e}")
        return None

def parse_led_commands_and_delays(blocks):
    """Parse LED commands with dynamic variable support and precise loop handling."""
    sequence = []

    def resolve_value(block, context):
        """Resolve block to its numerical value using context."""
        if block['type'] == 'variables_get':
            var_id = block['fields']['VAR']['id']
            return context.get(var_id, 0)
        elif block['type'] == 'math_number':
            return block['fields']['NUM']
        return 0

    def evaluate_condition(condition_block, context):
        """Evaluate condition with current context."""
        if condition_block['type'] == 'math_number_property':
            number_block = condition_block['inputs']['NUMBER_TO_CHECK'].get('block', {})
            number = resolve_value(number_block, context) if number_block else 0
            property_type = condition_block['fields']['PROPERTY']

            if property_type == 'EVEN':
                return number % 2 == 0
            elif property_type == 'ODD':
                return number % 2 != 0
            elif property_type == 'PRIME':
                if number < 2:
                    return False
                for i in range(2, int(number**0.5) + 1):
                    if number % i == 0:
                        return False
                return True
        return False

    def traverse_block(block, target_sequence, context=None):
        """Traverse blocks with variable context tracking."""
        current_context = context.copy() if context else {}
        
        if block['type'] == 'base_delay':
            delay_block = block['inputs']['DELAY_TIME'].get('block', {})
            delay = resolve_value(delay_block, current_context)
            target_sequence.append(('delay', delay))
            print(f"DEBUG: Added delay {delay}s (context: {current_context})")

        elif block['type'] == 'simulate_led':
            state = block['fields']['STATE'].lower()
            target_sequence.append(('led', state))
            print(f"DEBUG: Added LED {state} (context: {current_context})")

        elif block['type'] == 'controls_for':
            var_id = block['fields']['VAR']['id']
            from_val = resolve_value(block['inputs']['FROM']['block'], current_context)
            to_val = resolve_value(block['inputs']['TO']['block'], current_context)
            by_val = resolve_value(block['inputs']['BY']['block'], current_context)

            # Calculate actual iteration values
            iterations = []
            current = from_val
            while (by_val > 0 and current <= to_val) or (by_val < 0 and current >= to_val):
                iterations.append(current)
                current += by_val

            print(f"DEBUG: Processing for-loop with values {iterations}")
            
            for value in iterations:
                loop_context = current_context.copy()
                loop_context[var_id] = value
                do_block = block['inputs']['DO'].get('block', {})
                if do_block:
                    traverse_block(do_block, target_sequence, loop_context)

        elif block['type'] == 'controls_if':
            condition_block = block['inputs']['IF0'].get('block', {})
            if condition_block:
                condition_result = evaluate_condition(condition_block, current_context)
                print(f"DEBUG: Condition result: {condition_result} (context: {current_context})")
                if condition_result:
                    do_block = block['inputs']['DO0'].get('block', {})
                    if do_block:
                        traverse_block(do_block, target_sequence, current_context)

        elif block['type'] in ['controls_repeat', 'controls_repeat_ext']:
            times = (int(block['fields']['TIMES']) 
                    if block['type'] == 'controls_repeat' else
                    resolve_value(block['inputs']['TIMES'].get('block', {}), current_context))
            print(f"DEBUG: Found repeat loop with {times} iterations")

            do_block = block['inputs']['DO'].get('block', {})
            if do_block and times > 0:
                loop_body = []
                traverse_block(do_block, loop_body, current_context)
                target_sequence.extend(loop_body * times)

        elif block['type'] == 'controls_forEach':
            list_block = block['inputs']['LIST'].get('block', {})
            item_count = 0
            
            if list_block.get('type') == 'lists_create_with':
                item_count = sum(1 for key in list_block['inputs'] if key.startswith('ADD'))
                print(f"DEBUG: Found for-each loop with {item_count} items")

                if item_count > 0:
                    loop_body = []
                    do_block = block['inputs']['DO'].get('block', {})
                    if do_block:
                        traverse_block(do_block, loop_body, current_context)
                        target_sequence.extend(loop_body * item_count)

        # Process next block in chain
        next_block = block.get('next', {}).get('block', {})
        if next_block:
            traverse_block(next_block, target_sequence, current_context)

    # Start processing from root blocks
    current_blocks = blocks.get('blocks', [])
    for block in current_blocks:
        traverse_block(block, sequence)
    
    return sequence

def save_file(file, file_type):
    global last_led_command, last_high_sent_time

    if not file or file.filename == '':
        return None, jsonify({"error": "No file provided"}), 400, None

    file_content = file.read().decode('utf-8')
    print(f"DEBUG: Received {file_type} file content:\n{file_content}")

    json_data = json.loads(file_content)
    blocks = json_data.get("blocks", {})

    sequence = parse_led_commands_and_delays(blocks)

    file_document = {
        "filename": file.filename,
        "content": file_content,
        "file_type": file_type,
        "uploadDate": datetime.datetime.utcnow(),
        "sequence": sequence
    }
    result = collection.insert_one(file_document)

    for action in sequence:
        action_type, value = action
        if action_type == 'delay':
            print(f"DEBUG: Executing delay of {value} seconds")
            time.sleep(value)
        elif action_type == 'led':
            print(f"DEBUG: Executing LED command: {value}")
            send_command_to_esp32(value)

    return result, None, None, sequence

def send_led_command_sequentially(led_command, delay):
    """Sends the LED command with the specified delay in SECONDS."""
    print(f"DEBUG: Preparing to send LED command: {led_command} with delay: {delay} seconds")

    status = send_command_to_esp32(led_command)
    
    if status == 200:
        print(f"DEBUG: LED command {led_command} sent. Waiting {delay} seconds...")
        time.sleep(delay)  # Delay is in SECONDS
        print(f"DEBUG: Delay of {delay} seconds complete.")
    else:
        print(f"DEBUG: Failed to send {led_command}. Skipping delay.")



@app.route('/upload-xml', methods=['POST'])
def upload_xml():
    file = request.files.get('file')
    result, error_response, error_code, led_command = save_file(file, "xml")
    if error_response:
        return error_response, error_code
    return jsonify({
        "message": "XML file received successfully",
        "id": str(result.inserted_id),
        "led_command": led_command
    }), 200

@app.route('/upload-json', methods=['POST'])
def upload_json():
    file = request.files.get('file')
    result, error_response, error_code, led_command = save_file(file, "json")
    if error_response:
        return error_response, error_code
    return jsonify({
        "message": "JSON file received successfully",
        "id": str(result.inserted_id),
        "led_command": led_command
    }), 200

@app.route('/upload-txt', methods=['POST'])
def upload_txt():
    file = request.files.get('file')
    result, error_response, error_code, led_command = save_file(file, "txt")
    if error_response:
        return error_response, error_code
    return jsonify({
        "message": "TXT file received successfully",
        "id": str(result.inserted_id),
        "led_command": led_command
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
