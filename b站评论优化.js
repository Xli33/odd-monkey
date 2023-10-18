// ==UserScript==
// @name        b站评论显ip归属
// @description b站评论显ip归属，点击可调整文字颜色
// @author      (σ｀д′)σ
// @version     1.0
// @namespace   https://greasyfork.org/zh-CN/scripts/477707
// @license     GPL-3.0-or-later
// @match       *://www.bilibili.com/video/*
// @match       *://www.bilibili.com/bangumi/play/*
// @grant       GM_addStyle
// @run-at      document-end
// @supportURL   https://github.com/Xli33/fun-script
// @homepageURL  https://github.com/Xli33/fun-script
// ==/UserScript==

window.addEventListener("load", () => {
	"use strict";

	const getEl = (name) => document.querySelector(name);

	// 评论区节点
	const elComment = getEl("#comment") || getEl("#comment-module");
	if (!elComment) return;

	// 存在评论时才观察进行后续观察
	const commentWatcher = new MutationObserver((mutations) => {
		if (elComment.querySelector(".reply-list")) {
			commentWatcher.disconnect();
			watchReply();
		}
	});
	commentWatcher.observe(elComment, {
		childList: true,
		subtree: true,
	});

	// 观察评论列表
	const watchReply = () => {
		// 防重复执行mutation标记
		let flag;
		const elReplyList = getEl(".reply-list");
		const id = "--" + Math.floor(Math.random() * 10000);
		const labelClass = "com-ip" + id;

		// 要展示的信息元素
		const getExtraEle = (text) => {
			if (!text) return "";
			const ele = document.createElement("label");
			ele.className = labelClass;
			ele.innerHTML = `${text}<input type="color"/>`;
			ele.title = "点击调色";
			return ele;
		};

		// 处理子级评论
		// 子评论下有新的子评论，也可能是原评论位置变动
		const handleSubReply = (el) => {
			// console.log("%c子评论", "font-size:16px;color:cyan");
			const { reply_control } = el.__vueParentComponent.ctx.subReply;
			el.prepend(getExtraEle(reply_control.location));
		};

		// 观察评论区节点并给新评论增加ip等额外信息展示
		const replyAreaWatcher = new MutationObserver((mutations, observer) => {
			if (flag) {
				flag = null;
				return;
			}
			mutations.forEach((e) => {
				if (e.type !== "childList" || !e.addedNodes[0]) return;
				// 根评论下有新的子评论
				if (e.target === elReplyList) {
					const { reply_control } =
						e.addedNodes[0].__vueParentComponent.ctx.reply;
					e.addedNodes[0]
						.querySelector(".reply-info")
						.prepend(getExtraEle(reply_control.location));
					// 处理根评论下的子评论
					e.addedNodes[0]
						.querySelectorAll(".sub-reply-info")
						.forEach((se) => {
							handleSubReply(se);
						});
					flag = true;

					return;
				}
				if (
					e.target.classList.contains("sub-reply-list") &&
					e.addedNodes[0].classList.contains("sub-reply-item") &&
					!e.addedNodes[0].querySelector(
						".sub-reply-info > ." + labelClass,
					)
				) {
					handleSubReply(
						e.addedNodes[0].querySelector(".sub-reply-info"),
					);
					flag = true;
				}
			});
		});
		replyAreaWatcher.observe(elReplyList, {
			attributes: false,
			childList: true,
			subtree: true,
		});

		// 处理color input相关事件
		elReplyList.oninput = (e) => {
			if (e.target.parentNode.className === labelClass) {
				elReplyList.style.setProperty(id, e.target.value);
			}
		};
		elReplyList.onchange = (e) => {
			if (e.target.parentNode.className === labelClass) {
				// elReplyList.style.setProperty(id, e.target.value);
				localStorage._ipsv = e.target.value;
			}
		};
		elReplyList.onclick = (e) => {
			if (
				e.target.nodeName === "INPUT" &&
				e.target.parentNode.className === labelClass
			) {
				e.target.value = elReplyList.style.getPropertyValue(id);
			}
		};

		// 添加自定义css
		elReplyList.style.setProperty(id, localStorage._ipsv || "#959ab1");
		GM_addStyle(
			`.${labelClass}{margin-right:10px;color:var(${id})}.${labelClass}>input{overflow:hidden;width:0;height:0;border:none;visibility:hidden;}`,
		);
	};
});