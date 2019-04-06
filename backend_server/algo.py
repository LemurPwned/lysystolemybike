import numpy as np
from sklearn.cluster import KMeans


class Algo:
    def __init__(self, hub_number):
        self.running_average = 0.0
        self.hub_number = hub_number
        self.clf = KMeans(n_clusters=self.hub_number)

    def updateNodeSeverity(self, time_series, time_window, current_time, running_average):
        """
        time series => time series for today
        """
        # calculate MAD
        # return MAD
        if current_time < time_window:
            time_window = current_time
        past_time = current_time - time_window
        n = len(time_series)
        running_average = running_average + \
            time_series[current_time]/n + time_series[past_time]/n
        return running_average

    def three_sigma_test(self, time_series, past_time_series, time_window, current_time):
        """
        past time series => historic representation of past time series
        current time series => historic representation of past time series
        time widnow => calculation window
        """
        if current_time < time_window:
            time_window = current_time
        past_time_series_windowed = past_time_series[current_time-time_window:]
        past_time_series_3sigma = 3*np.var(past_time_series_windowed)
        past_mean = np.mean(past_time_series_windowed)

        current_time_series_windowed = time_series[current_time-time_window:]
        current_time_series_3sigma = 3*np.var(current_time_series_windowed)
        current_mean = np.mean(current_time_series_windowed)

        if (current_mean + current_time_series_3sigma) > (past_mean + past_time_series_3sigma):
            return 1.0
        elif (current_mean - current_time_series_3sigma) < (past_mean - past_time_series_3sigma):
            return -1.0
        else:
            return 0.0

    def designate_hubs(self, node_list):
        """
        create node matrix
        clf -> classifier class
        """
        kmeans_matrix = np.empty(shape=(len(node_list, 2)))
        kmeans_weight = np.empty(shape=(len(node_list,)))
        for i, node in enumerate(node_list):
            severity = node.severity
            position = node.position
            kmeans_matrix[i, :] = np.array([*position])
            kmeans_weight[i] = severity

        self.clf.fit_predict(
            kmeans_matrix, sample_weight=kmeans_weight)
        node_labels = self.clf.labels_
        hub_centers = self.clf.cluster_centers_
        return hub_centers


if __name__ == "__main__":
    alg = Algo(5)
    ts1 = np.random.random(size=(1000,))
    ts2 = np.random.random(size=(1000, ))
    run1 = alg.updateNodeSeverity(ts1, 100, 60, 0)
    run2 = alg.updateNodeSeverity(ts1, 100, 200, run1)
    print(f"Run 1 {run1}, run 2 {run2}")
    surprise = alg.three_sigma_test(ts1, ts2, 100, 300)
    print(surprise)
