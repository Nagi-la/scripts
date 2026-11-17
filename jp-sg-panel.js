/* Combined JP / SG dashboard. Private endpoints and account details are passed as arguments. */
(function () {
  "use strict";
  var params = {};
  String(typeof $argument === "undefined" ? "" : $argument).split("&").forEach(function (part) {
    var n = part.indexOf("=");
    if (n > 0) {
      try { params[part.slice(0, n)] = decodeURIComponent(part.slice(n + 1)); }
      catch (_) { params[part.slice(0, n)] = ""; }
    }
  });
  var names = ["JP", "SG"];
  var results = [null, null];
  var left = 2;
  var finished = false;
  function cleanPercent(value) {
    var text = String(value == null ? "" : value).trim();
    return /^\d+(\.\d+)?%?$/.test(text) ? text.replace(/%?$/, "%") : "--";
  }
  function display(value, fallback) {
    var text = String(value || "").replace(/[\x00-\x1f\x7f]/g, " ").trim();
    return text ? text.slice(0, 72) : fallback;
  }
  function receive(i, message) {
    if (finished || results[i] !== null) return;
    results[i] = message;
    left -= 1;
    if (left === 0) {
      finished = true;
      $done({title: "JP · SG", content: results.join("\n\n"), icon: "chart.bar.xaxis", "icon-color": "#5B9CFF"});
    }
  }
  names.forEach(function (name, i) {
    var key = name.toLowerCase();
    var address = params[key];
    var prefix = name + "\n";
    if (!/^https:\/\//i.test(address || "")) {
      receive(i, prefix + "连接地址未配置\n周期用量：待校准");
      return;
    }
    $httpClient.get({url: address, timeout: 8, headers: {"Cache-Control": "no-cache"}}, function (error, response, body) {
      if (error || !response || response.status < 200 || response.status >= 300) {
        receive(i, prefix + "状态：暂时无法获取\n周期用量：待校准");
        return;
      }
      try {
        var json = JSON.parse(body);
        var health = "CPU " + cleanPercent(json.cpu) + "  |  内存 " + cleanPercent(json.mem);
        // Do not display unreliable monthly counters from the old backend.
        var quota = display(params[key + "quota"], "待核实");
        var cycle = display(params[key + "cycle"], "待核实");
        receive(i, prefix + health + "\n已用：待校准  |  配额：" + quota + "\n剩余：待校准\n重置：" + cycle);
      } catch (_) {
        receive(i, prefix + "数据格式异常\n周期用量：待校准");
      }
    });
  });
})();
