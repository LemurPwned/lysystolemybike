from selenium import webdriver
from sys import platform
import requests
import os


class traffic_parser():
    def __init__(self):
        if platform == "linux" or platform == "linux2":
            # linux
            raise NotImplementedError()
        elif platform == "win32":
            self.driverPath = os.path.join(os.path.dirname(__file__), 'chromedriver.exe')
        else:
            raise Exception('Unknown OS')

        options = webdriver.ChromeOptions()
        # options.add_argument('headless')
        self.driver = webdriver.Chrome(executable_path=self.driverPath, chrome_options=options)
        self.driver.get('https://www.latlong.net/')

    def _get_point_names(self):
        app_id = 'rlMEySEzBAIiBb4wHJmK'
        app_code = 'titSvx7OlgN9VRkqP6058Q'
        url = f"""https://traffic.api.here.com/traffic/6.1/flow.json?bbox=50.0839%2C19.8824%3B50.0354%2C19.9669&app_id={app_id}&app_code={app_code}"""

        r = requests.get(url).json()

        aux = set()

        for RW in r['RWS'][0]['RW']:
            aux.add(RW['FIS'][0]['FI'][0]['TMC']['DE'])

        return aux

    def _resolve_name(self, name):

        place = self.driver.find_elements_by_id('place')
        confirm_button = self.driver.find_elements_by_id('btnfind')

        place.send_keys(name)
        self.driver.execute_script("arguments[0].click();", confirm_button)


if __name__ == '__main__':
    test = traffic_parser()
    # print(test._get_point_names())

    test._resolve_name('kek')
