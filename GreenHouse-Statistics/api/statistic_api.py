from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import os
import sys
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)
from function.statistic_test import describe_data, anova_analysis, tukey_test, t_test
from bs4 import BeautifulSoup

app = Flask(__name__)
CORS(app)

@app.route("/describe", methods=["POST"])
def describe():
    try:
        data = request.get_json()
        description = describe_data(data)
        return jsonify({"message": "Mô tả dữ liệu thành công", "description": description}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/anova", methods=["POST"])
def anova():
    try:
        data = request.get_json()
        result = anova_analysis(data)
        return jsonify({"message": "Phân tích ANOVA thành công", "result": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/tukey", methods=["POST"])
def tukey():
    try:
        data = request.get_json()
        result = tukey_test(data)
        soup = BeautifulSoup(result, 'html.parser')
        rows = soup.find_all('tr')
        headers = [header.text for header in rows[0].find_all('th')]
        data = []
        for row in rows[1:]:
            data.append({headers[i]: cell.text for i, cell in enumerate(row.find_all('td'))})
        return jsonify({"message": "Kiểm định Tukey thành công", "result": data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/t_test", methods=["POST"])
def t_test_route():
    try:
        data = request.get_json()
        result = t_test(data)
        return jsonify({"message": "Kiểm định T thành công", "result": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/read", methods=["POST"])
def read():
    try:
        data = request.get_json()
        return jsonify({"message": "Đọc dữ liệu thành công", "result": data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/hello", methods=["POST"])
def hello():
    return "Xin chào!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
