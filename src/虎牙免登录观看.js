// ==UserScript==
// @name        虎牙免登录观看
// @description 虎牙免登录观看时无限制播放，并隐藏进入页面后的登录框，若需要登录请勿安装！！
// @author      (σ｀д′)σ
// @version     1.0
// @namespace   https://greasyfork.org/zh-CN/scripts/477947
// @license     GPL-3.0-or-later
// @match       *://www.huya.com/*
// @run-at      document-end
// @grant       GM_addStyle
// @supportURL  https://github.com/Xli33/odd-script
// @homepageURL https://github.com/Xli33/odd-script
// ==/UserScript==

(() => {
  "use strict";

  // 禁止虎牙篡改原生console
  // Object.freeze(console);

  window.addEventListener("load", () => {
    const getById = (id) => document.getElementById(id);

    // 隐藏进入页面后的登录弹窗
    new MutationObserver((mutations, ob) => {
      const mask = getById("UDBSdkLgn");
      if (mask) {
        // 插入登录框后则只监听该元素的变更
        new MutationObserver((records, mob) => {
          if (mask?.style.display === "block") {
            mask.style.display = "none";
            mob.disconnect();
          }
        }).observe(mask, {
          attributes: true,
        });
        // 无限制播放
        getById("hy-video").srcObject.active = false;
        ob.disconnect();
      }
    }).observe(document.body, {
      attributes: false,
      childList: true,
      subtree: false,
    });

    // 观察节点自动点击播放模式
    // function autoPlay() {
    //   GM_addStyle("div#UDBSdkLgn{z-index: -1;}");
    //   const targetNode =
    //     getById("player-ctrl-wrap").querySelector(".player-play-big");

    //   new MutationObserver((mutationsList, ob) => {
    //     // console.log(mutationsList)
    //     if (
    //       mutationsList[0].type !== "attributes" ||
    //       targetNode.style.display === "none"
    //     )
    //       return;
    //     const mask = getById("UDBSdkLgn");
    //     if (mask.style.display === "block") {
    //       targetNode.click();
    //       mask.style.display = "none";
    //       // console.log('自动续播成功')
    //     }
    //   }).observe(targetNode, {
    //     attributes: true,
    //     childList: false,
    //     subtree: false,
    //   });
    // }
  });
})();
