from flask import Flask, jsonify
import logging

if __name__ == "__main__":
    
    app = Flask(__name__)
    app.logger.disabled = True
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR)

    @app.route('/get_hubs')
    def get_hubes():
        return 'Hello, World!'

    @app.route('/get_nodes')
    def get_nodes():
        return 'Hello, World!'

    app.run(host="0.0.0.0", port=8088, debug=True)