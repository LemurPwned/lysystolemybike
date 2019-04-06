
class Node:
	def __init__(self, id, localization, history, severity):
		self.id = id
		self.localization = localization
		self.history = history
		self.severity = severity

	def update_severity(self, values):
		pass

	def update_day_history(self):
		pass