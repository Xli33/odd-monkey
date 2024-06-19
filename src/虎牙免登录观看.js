// ==UserScript==
// @name        虎牙免登录观看
// @description 虎牙未登录时不自动暂停，并隐藏进入页面后的登录框，解锁登录清晰度，若需要登录请勿使用！！
// @author      (σ｀д′)σ
// @version     1.4.0
// @namespace   https://greasyfork.org/zh-CN/scripts/477947
// @license     GPL-3.0-or-later
// @match       *://www.huya.com/*
// // @include     /^https:\/\/www\.huya\.com\/[^/]+\/?$/
// @run-at      document-end
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_registerMenuCommand
// @grant       GM_unregisterMenuCommand
// @supportURL  https://greasyfork.org/zh-CN/scripts/477947
// @homepageURL https://github.com/Xli33/odd-monkey
// ==/UserScript==

(() => {
  'use strict';

  // 禁止虎牙篡改原生console
  // Object.freeze(console);

  // 更改菜单选项
  function changeMenuItem(id, onCaption, offCaption, onClick) {
    const inplace = id === GM_registerMenuCommand(offCaption, null, { id });
    if (inplace) {
      // 插件如VM2.15.9起支持根据id注册选项
      GM_registerMenuCommand(onCaption, onClick, { id });
    } else {
      // 不支持需先卸载原选项，再注册新选项
      GM_unregisterMenuCommand(offCaption);
      GM_registerMenuCommand(onCaption, onClick);
    }
  }
  // 注册可变菜单项
  function registerToggle(id, onCaption, offCaption, onClick) {
    changeMenuItem(id, onCaption, offCaption, () => {
      onClick();
      registerToggle(id, offCaption, onCaption, onClick);
    });
  }

  // 待注册
  const toggles = [
    {
      id: 1,
      title: '自动最高画质',
      gmKey: 'autoBestRES',
      gmValue: GM_getValue('autoBestRES')
    },
    {
      id: 2,
      title: '单击/空格控制播放/暂停',
      gmKey: 'clickToPlay',
      gmValue: GM_getValue('clickToPlay', true)
    },
    {
      id: 3,
      title: '中键/回车切换全屏',
      gmKey: 'midClickToFullscreen',
      gmValue: GM_getValue('midClickToFullscreen', true)
    }
  ];
  toggles.forEach((e) => {
    registerToggle(
      e.id,
      (e.gmValue ? '✔️' : '✖️') + e.title,
      (!e.gmValue ? '✔️' : '✖️') + e.title,
      () => {
        e.gmValue = !e.gmValue;
        GM_setValue(e.gmKey, e.gmValue);
      }
    );
  });

  window.addEventListener('load', () => {
    const getById = (id) => document.getElementById(id);

    // 隐藏进入页面后的登录弹窗
    new MutationObserver((mutations, ob) => {
      const mask = getById('HUYA-UDBSdkLgn');
      if (!mask) return;

      const $vtList = $('#player-ctrl-wrap .player-videotype-list'),
        unlockRES = () => {
          $vtList.children(':has(.bitrate-right-btn.login-enjoy-btn)').each((i, e) => {
            $(e).data('data').status = 0;
            // 若启用了自动最高画质
            i === 0 && toggles[0].gmValue && e.click();
          });
        };

      // 插入登录框后则只监听该元素的变更
      new MutationObserver((records, mob) => {
        if (mask?.style.display === 'block') {
          mask.style.display = 'none';
          mob.disconnect();
        }
      }).observe(mask, {
        attributes: true
      });

      // 无限制播放，避免严格模式下对getter属性赋值导致异常中断
      try {
        getById('hy-video').srcObject.active = false;
      } catch (e) {}
      ob.disconnect();

      // 解锁需要登录的清晰度
      new MutationObserver(unlockRES).observe($vtList[0], {
        attributes: false,
        childList: true,
        subtree: false
      });
      unlockRES();

      // 添加部分播放器事件
      setTimeout(() => {
        const vid = getById('player-video');

        // 单击/空格控制播放/暂停
        if (toggles[1].gmValue) {
          let isOneClick, tmp, tid;
          // 判断是否触发虎牙播放器单击模拟的双击
          vid.addEventListener('click', (e) => {
            isOneClick = !tmp;
            if (isOneClick) {
              tmp = setTimeout(() => {
                tmp = null;
              }, 301);
            }
          });
          vid.onclick = (e) => {
            clearTimeout(tid);
            if (!(getById('smartMenu_videoMenu')?.style.display === 'block')) {
              tid = setTimeout(() => {
                isOneClick && getById('player-btn').click();
              }, 300);
            }
          };
          document.addEventListener('keyup', (e) => {
            if (e.code === 'Space' && !'INPUT TEXTAREA'.includes(e.target.nodeName)) {
              e.preventDefault();
              getById('player-btn').click();
            }
          });
        }
        // 中键/回车切换全屏
        if (toggles[2].gmValue) {
          vid.onmousedown = (e) => e.preventDefault();
          vid.onauxclick = (e) => {
            e.button === 1 && getById('player-fullscreen-btn').click();
          };
          document.addEventListener('keyup', (e) => {
            e.key === 'Enter' &&
              !'INPUT TEXTAREA'.includes(e.target.nodeName) &&
              getById('player-fullscreen-btn').click();
          });
        }
      });
    }).observe(document.body, {
      attributes: false,
      childList: true,
      subtree: false
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
