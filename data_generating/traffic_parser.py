import requests

class traffic_parser():
	def __init__(self):
		

	def _get_point_names(self):
		app_id = 'rlMEySEzBAIiBb4wHJmK'
		app_code = 'titSvx7OlgN9VRkqP6058Q'
		url = f"""https://traffic.api.here.com/traffic/6.1/flow.json?bbox=50.0839%2C19.8824%3B50.0354%2C19.9669&app_id={app_id}&app_code={app_code}"""
		
		r = requests.get(url).json()
		
		aux = set()

		for RW in r['RWS'][0]['RW']:
			aux.add(RW['FIS'][0]['FI'][0]['TMC']['DE'])

		return aux

	def _resolve_name(self):


if __name__ == '__main__':
	test = traffic_parser()
	print(test._get_point_names())