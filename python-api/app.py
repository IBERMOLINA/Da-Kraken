from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/manufacturing-steps', methods=['GET'])
def get_manufacturing_steps():
    steps = [
        {"id": 1, "title": "Define Tool Requirements", "description": "Clearly define the purpose, features, and constraints of your digital tool."},
        {"id": 2, "title": "Design the User Interface", "description": "Create wireframes and mockups for an intuitive and engaging user experience."},
        {"id": 3, "title": "Develop the Core Logic", "description": "Implement the main functionality and algorithms of your tool."},
        {"id": 4, "title": "Integrate with APIs", "description": "Connect to external services and data sources to enhance your tool's capabilities."},
        {"id": 5, "title": "Test and Refine", "description": "Thoroughly test your tool for bugs and gather feedback for improvements."},
        {"id": 6, "title": "Deploy and Share", "description": "Make your tool available to users and share it with the world."}
    ]
    return jsonify(steps)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
