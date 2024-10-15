import os
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'  # Specify the folder for audio uploads
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

@app.route('/api/hello')
def hello_world():
    return jsonify({"message": "Hello from the backend!"})

@app.route('/api/upload', methods=['POST'])
def upload_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file part"}), 400

    audio_file = request.files['audio']
    filename = request.args.get('filename', audio_file.filename)

    if audio_file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    audio_file.save(file_path)
    return jsonify({"message": f"File '{filename}' successfully uploaded"}), 201

if __name__ == '__main__':
    app.run(debug=True, port=3001)
