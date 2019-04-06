function renderChart(data, labels, nodeId) {
  var ctx = document.getElementById("myChart").getContext("2d");
  var myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: `Node ${nodeId}`,
          data: data
        }
      ]
    }
  });
}

var nodeId = 20;

$.ajax({
  url: "http://localhost:5000/trigger_calc",
  type: "GET",
  dataType: "json",
  success: renderData,
  error: function(result) {
    console.log(result.status + " " + result.statusText);
  }
});

function renderData(result) {
  data = result["nodes"][nodeId]["history"]["today"];
  labels = [];
  for (i = 0; i < data.length; i++) {
    labels.push(i);
  }

  renderChart(data, labels, nodeId);
}
