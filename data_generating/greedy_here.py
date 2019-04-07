import requests
import random
import tqdm

class URLBuilder:
    def __init__(self, resolution):
        self.resolution = resolution
        self.template = "https://traffic.api.here.com/traffic/6.1/flow.json?bbox={0}%2C{1}%3B{2}%2C{3}&app_id=rlMEySEzBAIiBb4wHJmK&app_code=titSvx7OlgN9VRkqP6058Q"

    def build(self, center):
        return self.template.format(center[1] + self.resolution[1], center[0] - self.resolution[0],
                                    center[1] - self.resolution[1], center[0] + self.resolution[0])


class HereAPI:
    def __init__(self):
        self.resolution = (0.05, 0.05)
        self.url_builder = URLBuilder(self.resolution)
        self.ylim = (49.9702, 50.1290)
        self.xlim = (19.7596, 20.1111)

        self.rand_boxes = (
        int((self.xlim[1] - self.xlim[0]) // self.resolution[0]), int((self.ylim[1] - self.ylim[0]) // self.resolution[1]))

        self.cache = None

    def sample(self, node_number):
        res = []
        centers = []

        if self.cache is None:
            for _ in tqdm.trange(node_number):
                x = random.random()*(self.xlim[1]-self.xlim[0])+self.xlim[0]
                y = random.random()*(self.ylim[1]-self.ylim[0])+self.ylim[0]
                center = (x, y)
                try:
                    parsed = self.sample_centroid(center)
                    res.extend(parsed)
                    centers.append(center)
                except:
                    pass

            self.cache = (centers, res)
            return centers, res
        else:
            return self.cache

    def sample_centroid(self, centroid):
        try:
            url = self.url_builder.build(centroid)
            r = requests.get(url)
            parsed = self.parse_street(r.json())
            return parsed
        except:
            return None

    def parse_street(self, res):
        aux = set()

        for RW in res['RWS'][0]['RW'][0]['FIS']:
            for street in RW['FI']:
                aux.add(street['CF'][0]['JF'])

        return aux

if __name__ == "__main__":
    api = HereAPI()
    print(api.sample())