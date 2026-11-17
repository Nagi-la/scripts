/* Combined JP / SG probe panel. All addresses and account-specific labels are passed as arguments. */
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
  var names = ["JP", "SG"], results = [null, null], left = 2, finished = false;
  function percent(value) {
    var text = String(value == null ? "" : value).trim();
    return /^\d+(\.\d+)?%?$/.test(text) ? text.replace(/%?$/, "%") : "--";
  }
  function label(value, fallback) {
    var text = String(value || "").replace(/[\x00-\x1f\x7f]/g, " ").trim();
    return text ? text.slice(0, 72) : fallback;
  }
  function complete(i, message) {
    if (finished || results[i] !== null) return;
    results[i] = message;
    if (--left === 0) {
      finished = true;
      $done({title: "JP · SG", content: results.join("\n\n"), icon: "chart.bar.xaxis", "icon-color": "#5B9CFF"});
    }
  }
  function formatGB(value) {
    return typeof value === "number" && isFinite(value) && value >= 0 ? value.toFixed(2) + " GB" : null;
  }
  function updateTime(seconds) {
    if (typeof seconds !== "number" || !isFinite(seconds) || seconds <= 0) return "--";
    return new Date((seconds + 8 * 3600) * 1000).toISOString().slice(0, 16).replace("T", " ") + " UTC+8";
  }
  names.forEach(function (name, i) {
    var key = name.toLowerCase(), url = params[key], prefix = name + "\n";
    if (!/^https:\/\//i.test(url || "")) { complete(i, prefix + "地址未配置\n用量：待校准"); return; }
    $httpClient.get({url: url, timeout: 8, headers: {"Cache-Control": "no-cache"}}, function (err, response, body) {
      if (err || !response || response.status < 200 || response.status >= 300) {
        complete(i, prefix + "状态：暂时无法获取\n用量：待校准"); return;
      }
      try {
        var data = JSON.parse(body);
        var health = "CPU " + percent(data.cpu) + "  |  内存 " + percent(data.mem);
        var cycle = label(params[key + "cycle"], "待核实");
        var now = Math.floor(Date.now() / 1000);
        var started = data.probe_started_at, updated = data.probe_updated_at, observed = data.observed_at;
        var timestampsOK = Number.isInteger(started) && Number.isInteger(updated) && Number.isInteger(observed) &&
          started > 0 && updated >= started && updated <= observed + 60 && observed - updated <= 900 &&
          Math.abs(now - observed) <= 900;
        var valid = data.schema === "minis-vnstat-v2" && data.node === name &&
          data.quality === "estimated-with-gap" && data.gap === true &&
          data.scope === "historical-reference-not-bill" && timestampsOK;
        var used = valid ? formatGB(data.used_gb) : null;
        var quota = valid ? formatGB(data.quota_gb) : null;
        var remain = valid ? formatGB(data.remaining_gb) : null;
        if (!used || !quota || (name === "JP" && !remain)) {
          var reason = data.quality === "period-ended" ? "账期已到，待校准" :
            data.quality === "probe-stale" ? "探针数据过期" :
            data.quality === "probe-recreated" || data.quality === "probe-counter-reset" ? "探针数据异常" : "待校准";
          complete(i, prefix + health + "\n用量：" + reason + "\n重置：" + cycle);
          return;
        }
        var numbers = name === "JP" ? "参考已用 ≈ " + used + " / " + quota + "\n参考余量 ≈ " + remain :
          "参考总和 ≈ " + used + "\n配额 " + quota + "（待核实），余量待核实";
        complete(i, prefix + health + "\n" + numbers + "\n重置：" + cycle +
          "\n探针更新：" + updateTime(updated) + "\n旧值＋探针增量，缺口未知，非账单");
      } catch (_) { complete(i, prefix + "数据格式异常\n用量：待校准"); }
    });
  });
})();
