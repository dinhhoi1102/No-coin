"use strict";
var currentTabId = 0,
    whitelisted = !1,
    domain = "",
    setToggleButton = function(e) {
        var t = document.querySelector(".toggle");
        (t.classList.contains("disabled") && e || !t.classList.contains("disabled") && !e) && t.classList.toggle("disabled"), toggleClassVisible("whitelisting", e), t.innerText = (e ? "Pause" : "Resume") + " No Coin"
    },
    toggleClassVisible = function(e, t) {
        for (var i = document.getElementsByClassName(e), s = 0; s < i.length; s++) i[s].style.display = t ? "block" : "none"
    },
    setWhitelistDisplay = function(e) {
        whitelisted = e, document.querySelector(".whitelisted")
            .innerHTML = "<b>" + domain + "</b> is currently white listed.", toggleClassVisible("dropdown", !e), toggleClassVisible("whitelist", !e), toggleClassVisible("unwhitelist", e), toggleClassVisible("whitelisted", e)
    },
    setDetectedVisible = function(e) {
        document.querySelector(".detected")
            .style.display = e ? "block" : "none"
    },
    setVersion = function(e) {
        document.querySelector(".version")
            .innerText = e
    },
    sendWhitelistUpdate = function(e) {
        chrome.runtime.sendMessage({
            type: "WHITELIST",
            time: e,
            tabId: currentTabId,
            whitelisted: whitelisted
        }, function(e) {
            setWhitelistDisplay(e), chrome.tabs.reload(currentTabId)
        })
    };
document.querySelector(".toggle")
    .addEventListener("click", function() {
        chrome.runtime.sendMessage({
            type: "TOGGLE"
        }, function(e) {
            setToggleButton(e), chrome.tabs.reload(currentTabId)
        })
    }), document.querySelector(".whitelist")
    .addEventListener("click", function() {
        var e = document.querySelector(".dropdown")
            .value;
        sendWhitelistUpdate(e)
    }), document.querySelector(".unwhitelist")
    .addEventListener("click", function() {
        sendWhitelistUpdate()
    }), chrome.tabs.query({
        currentWindow: !0,
        active: !0
    }, function(e) {
        e && e[0] && (currentTabId = e[0].id, chrome.runtime.sendMessage({
            type: "GET_STATE",
            tabId: currentTabId
        }, function(e) {
            domain = e.domain, setVersion(e.version), setToggleButton(e.toggle), setWhitelistDisplay(e.whitelisted), setDetectedVisible(e.detected)
        }))
    });