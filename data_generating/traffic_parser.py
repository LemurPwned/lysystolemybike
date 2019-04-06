from selenium import webdriver
from sys import platform
import requests
import time
import os


class traffic_parser():
    def __init__(self):
        if platform == "linux" or platform == "linux2":
            # linux
            raise NotImplementedError()
        elif platform == "win32":
            self.driverPath = os.path.join(
                os.path.dirname(__file__), 'chromedriver.exe')
        else:
            raise Exception('Unknown OS')

        options = webdriver.ChromeOptions()
        # options.add_argument('headless')
        self.driver = webdriver.Chrome(
            executable_path=self.driverPath, chrome_options=options)
        self.driver.get('https://mapdevelopers.com/geocode_tool.php')

    def _get_point_names(self):
        # app_id = 'rlMEySEzBAIiBb4wHJmK'
        app_id = 'devportal-demo-20180625'
        # app_code = 'titSvx7OlgN9VRkqP6058Q'
        app_code = '9v2BkviRwi9Ot26kp2IysQ'
        url = f"""https://traffic.api.here.com/traffic/6.1/flow.json?bbox=50.0839%2C19.8824%3B50.0354%2C19.9669&app_id={app_id}&app_code={app_code}"""

        r = requests.get(url).json()

        aux = set()

        for RW in r['RWS'][0]['RW']:
            aux.add(RW['FIS'][0]['FI'][0]['TMC']['DE'])

        return aux

    def _resolve_name(self, name):

        place = self.driver.find_element_by_class_name('form-control')
        confirm_button = self.driver.find_element_by_class_name(
            'input-group-btn').find_element_by_class_name('btn')

        place.send_keys(name)
        # confirm_button.click()
        self.driver.execute_script('arguments[0].click();', confirm_button)
        place.clear()

        time.sleep(5)

    # latitude = self.driver.find_element_by_name('lat').text
    # longtitude = self.driver.find_element_by_name('lng').text

    # print(latitude)
    # print(longtitude)


if __name__ == '__main__':
    test = traffic_parser()
    zomg = list(test._get_point_names())
    print(zomg)

    for kek in zomg:
        test._resolve_name(kek)
