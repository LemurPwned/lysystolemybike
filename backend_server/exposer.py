from flask import Flask, jsonify
from collections import deque
from generator import OUNoise
import logging
from time import sleep
import matplotlib.pyplot as plt
from threading import Thread

class Exposer:
    def __init__(self):
        self.data = deque(maxlen=2200)
        self.app = Flask(__name__)
        self.app.logger.disabled = True
        log = logging.getLogger('werkzeug')
        log.setLevel(logging.ERROR)

        @self.app.route('/')
        def return_data():
            jsoned_data = jsonify({'data': list(self.data)})
            self.data = deque(maxlen=2200)
            return jsoned_data

    def start(self):
        print('Exposer run on port 5000')
        self.app.run(host='0.0.0.0', debug=True)


    def process(self, data):
        self.data.extend(data.tolist())
        return list(data)


if __name__ == "__main__":
    a = Exposer()
    generator = OUNoise(size=[1], seed = 42, mu=0.5, theta=0.15, sigma=0.2)
    Thread(target=generator.start, args=(a,)).start()
    a.start()
