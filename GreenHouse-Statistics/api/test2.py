from flask import Flask, jsonify
import pandas as pd
import os
import sys
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)
from function.statistic_test import describe_data, anova_analysis, tukey_test, t_test
from bs4 import BeautifulSoup

app = Flask(__name__)
# Đường dẫn đến file JSON
file_path = os.path.join("..", "data", "data.json")

@app.route("/describe", methods=["GET"])
def describe():
    try:
        data = read_json_file(file_path)
        description = describe_data(data)
        return jsonify({"message": "Data described successfully", "description": description})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/anova", methods=["GET"])
def anova():
    try:
        data = read_json_file(file_path)
        result = anova_analysis(data)
        return jsonify({"message": "ANOVA analysis performed successfully", "result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/tukey", methods=["GET"])
def tukey():
    try:
        data = read_json_file(file_path)
        result = tukey_test(data)
        soup = BeautifulSoup(result, 'html.parser')
        rows = soup.find_all('tr')
        headers = [header.text for header in rows[0].find_all('th')]
        data = []
        for row in rows[1:]:
            data.append({headers[i]: cell.text for i, cell in enumerate(row.find_all('td'))})
        return jsonify({"message": "Tukey test performed successfully", "result": data})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/t_test", methods=["GET"])
def t_test_route():
    try:
        data = read_json_file(file_path)
        result = t_test(data)
        return jsonify({"message": "T-test performed successfully", "result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/read", methods=["GET"])
def read():
    try:
        data = read_json_file(file_path)
        return jsonify({"message": "Data read successfully", "data": data.to_dict(orient='records')})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/hello", methods=["GET"])
def hello():
    return "Xin chào!"

if __name__ == "__main__":
    app.run(debug=True)