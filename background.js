"use strict";
function _toConsumableArray(t) {
    if (Array.isArray(t)) {
        for (var e = 0, o = Array(t.length); e < t.length; e++) o[e] = t[e];
        return o
    }
    return Array.from(t)
}
var _extends = Object.assign || function(t) {
        for (var e = 1; e < arguments.length; e++) {
            var o = arguments[e];
            for (var n in o) Object.prototype.hasOwnProperty.call(o, n) && (t[n] = o[n])
        }
        return t
    },
    defaultConfig = {
        toggle: !0,
        whitelist: [{
            domain: "cnhv.co",
            expiration: 0
        }]
    },
    localConfig = JSON.parse(localStorage.getItem("config")),
    config = _extends({}, defaultConfig, localConfig),
    domains = [],
    detected = [],
    saveConfig = function() {
        localStorage.setItem("config", JSON.stringify(config))
    },
    changeToggleIcon = function(t) {
        chrome.browserAction.setIcon({
            path: "" + (t ? "logo_enabled" : "logo_disabled") + ".png"
        })
    },
    getDomain = function(t) {
        var e = t.match(/:\/\/(.[^/]+)/);
        return e ? e[1] : ""
    },
    getTimestamp = function() {
        return Math.floor(Date.now() / 1e3)
    },
    isDomainWhitelisted = function(t) {
        if (!t) return !1;
        var e = config.whitelist.find(function(e) {
            return e.domain === t
        });
        return !!e && (!(0 !== e.expiration && e.expiration <= getTimestamp()) || (removeDomainFromWhitelist(t), !1))
    },
    addDomainToWhitelist = function(t, e) {
        t && (e = +e || 0, isDomainWhitelisted(t) || (config.whitelist = [].concat(_toConsumableArray(config.whitelist), [{
            domain: t,
            expiration: 0 === e ? 0 : getTimestamp() + 60 * e
        }]), saveConfig()))
    },
    removeDomainFromWhitelist = function(t) {
        t && (config.whitelist = config.whitelist.filter(function(e) {
            return e.domain !== t
        }), saveConfig())
    },
    runBlocker = function(t) {
        var e = t.split("\n");
        chrome.webRequest.onBeforeRequest.addListener(function(t) {
            return chrome.browserAction.setBadgeBackgroundColor({
                color: [200, 0, 0, 100],
                tabId: t.tabId
            }), chrome.browserAction.setBadgeText({
                text: "!",
                tabId: t.tabId
            }), detected[t.tabId] = !0, config.toggle ? isDomainWhitelisted(domains[t.tabId]) ? (chrome.browserAction.setIcon({
                path: "logo_enabled_whitelisted.png",
                tabId: t.tabId
            }), {
                cancel: !1
            }) : (chrome.browserAction.setIcon({
                path: "logo_enabled_blocked.png",
                tabId: t.tabId
            }), {
                cancel: !0
            }) : {
                cancel: !1
            }
        }, {
            urls: e
        }, ["blocking"])
    },
    runFallbackBlocker = function() {
        fetch(chrome.runtime.getURL("blacklist.txt"))
            .then(function(t) {
                t.text()
                    .then(function(t) {
                        return runBlocker(t)
                    })
            })
    };
chrome.tabs.onUpdated.addListener(function(t, e, o) {
    domains[t] = getDomain(o.url), "loading" === e && (config.toggle && chrome.browserAction.setIcon({
        path: "logo_enabled.png",
        tabId: t
    }), detected[details.tabId] = !1, chrome.browserAction.setBadgeText({
        text: "",
        tabId: t
    }))
}), chrome.tabs.onRemoved.addListener(function(t) {
    delete domains[t]
}), config.toggle || changeToggleIcon(!1);
var blacklist = "https://raw.githubusercontent.com/keraf/NoCoin/master/src/blacklist.txt";
fetch(blacklist)
    .then(function(t) {
        if (200 !== t.status) throw "HTTP Error";
        t.text()
            .then(function(t) {
                if ("" === t) throw "Empty response";
                runBlocker(t)
            })
    })
    .catch(function(t) {
        runFallbackBlocker()
    }), chrome.runtime.onMessage.addListener(function(t, e, o) {
        switch (t.type) {
            case "GET_STATE":
                o({
                    version: chrome.runtime.getManifest()
                        .version,
                    whitelisted: isDomainWhitelisted(domains[t.tabId]),
                    domain: domains[t.tabId],
                    detected: detected[t.tabId] || !1,
                    toggle: config.toggle
                });
                break;
            case "TOGGLE":
                config.toggle = !config.toggle, saveConfig(), changeToggleIcon(config.toggle), o(config.toggle);
                break;
            case "WHITELIST":
                t.whitelisted ? removeDomainFromWhitelist(domains[t.tabId], t.time) : addDomainToWhitelist(domains[t.tabId], t.time), o(!t.whitelisted)
        }
    });
