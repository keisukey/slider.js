/**
 * slider
 *
 * multirole slider plug-in
 *
 * @category	jQuery plugin
 * @license		http://www.opensource.org/licenses/mit-license.html	 MIT License
 * @copyright	2010 RaNa design associates, inc.
 * @author		keisuke YAMAMOTO <keisukey@ranadesign.com>
 * @link		http://www.ranadesign.com/
 * @version		4.0
 * @since		Aug 30, 2010
 * @update		Feb 13, 2014
 */

;(function($) {

	// for mobile =============================
	var mobile = "createTouch" in document;

	// slider ====================================
	$.fn.slider = function(param) {
		// 初期設定 ------------------------- //

		// 初期値
		var def = {
			loop: true,			// ループさせるかどうか
			time: 10,			// 1px動かすのにかける時間
			speed: 1,			// 早送りや遅送りの比率指定
			direction: "left",	// 送り方向
			reverse: true,		// コントロール方向を逆向きにするかどうか
			auto: true,			// trueで「自動実行」falseで「手動(コントロール)実行｣
			easing: "linear",	// イージングの初期値
			guideSelector: ".slideGuide",	// ガイド用クラス名
			cellSelector: ".slideCell", // セル用クラス名
			ctrlSelector: ".slideCtrl", // コントローラー用クラス名
			ctrlClick: false,	// コントローラ操作用イベントハンドラ(click)
			ctrlHover: true,	// コントローラ操作用イベントハンドラ(hover)
			draggable: false,	// スライドをドラッグで操作するかどうか
			dragCursorOpen: "open.cur", // ドラッグ可能時のカーソルアイコン
			dragCursorClose: "close.cur", // ドラッグ中のカーソルアイコン
			shuttle: false,		// 往復スライドにするかどうか
			once: false,		// 動きを1コマずつ止めるかどうか
			restart: true,		// リスタートするかどうか(clickイベント用)
			restartTime: 3000,	// リスタートまでの待ち時間
			pause: true,		// マウスオーバー時に一時停止するかどうか
			build: true,		// 暗黙のオプション（幅の初期設定）falseで幅設定をしない
			sp: 1				// 基本速度
		};

		return this.each(function() {

			// プライベート用のプロパティの上書き禁止
			if (param) {
				delete param.guide;
				delete param.sp;
			}
			
			// パラメータ受け渡し
			$.extend(def, param);
			def.guide = $(this).find(def.guideSelector);

			// draggableかshuttleがtrueの時は関係するオプションをオフにする
			if (def.draggable || def.shuttle) def.loop = def.auto = def.pause = false;

			// 内部処理用プロパティ設定
			def.d = def.direction; // 方向の初期設定を記憶
			def.cell = def.cellSelector;
			def.ctrl = def.ctrlSelector;
			def.curOpen = "url(" + def.dragCursorOpen + "), default";
			def.curClose = "url(" + def.dragCursorClose + "), default";
			def.mousedownX = 0;
			
			// パラメータやセレクターが不正または無効な場合は次へ
			if (!def.guide || def.loop && !def.guide.children(def.cell).length || !def.loop && def.guide.hasClass(def.guideSelector)) return true;
			
			// frame枠の取得
			def.frameBorder = def.guide.offset().left - def.guide.parent().offset().left;
			// cellマージンの取得
			def.horizontalMargin = def.guide.find(def.cell).eq(0).outerWidth(true) - def.guide.find(def.cell).eq(0).outerWidth();
			def.verticalMargin = def.guide.find(def.cell).eq(0).outerHeight(true) - def.guide.find(def.cell).eq(0).outerHeight();

			// for mobile
			def.handlerMousedown = mobile ? "touchstart" : "mousedown";
			def.handlerMousemove = mobile ? "touchmove" : "mousemove";
			def.handlerMouseup = mobile ? "touchend" : "mouseup";

			// init 定義 =============================
			// スライド枠の幅設定
			var init = function(def) {
				var cell = def.guide.find(def.cell);
				// slideCellの数調整。足りない時にコピーして増やす。
				var max = 0;
				var size = 0;
				switch (def.direction) {
					case "up":
					case "down":
						// セルの合計幅と最大幅を取得する。
						cell.each(function() {
							max = max > $(this).outerHeight() ? max : $(this).outerHeight();
							size += $(this).outerHeight(true);
						});
						// ループしない時はセルを増やさない。ガイド幅をセルの合計幅に合わせて終了。
						if (!def.loop) {
							def.guide.height(size);
							return false;
						}
						// フレーム枠を超えるまでセルを増やす。
						while (size < def.guide.parent().height() + max) {
							cell.clone(true).appendTo(def.guide);
							size += cell.outerHeight();
						}
						// slideGuideのサイズを合計幅＋最大幅にする。
						def.guide.height(size + max);
						break;
					case "left":
					case "right":
					default:
						// セルの合計幅と最大幅を取得する。
						cell.each(function() {
							max = max > $(this).outerWidth() ? max : $(this).outerWidth();
							size += $(this).outerWidth(true);
						});
						// ループしない時はセルを増やさない。ガイド幅をセルの合計幅に合わせて終了。
						if (!def.loop) {
							def.guide.width(size);
							return false;
						}
						// フレーム枠を超えるまでセルを増やす。
						while (size < def.guide.parent().width() + max) {
							cell.clone(true).appendTo(def.guide);
							size += cell.outerWidth();
						}
						// slideGuideのサイズを合計幅＋最大幅にする。
						def.guide.width(size + max);
				}
			}
			var initTimerId = 0;

			// slider 定義 ==========================
			// ループする場合は「先頭セルを左に移動させたあと、最終セルの後ろに移動させる」を繰り返す。
			var slider = function(par) {
				var cell = par.guide.find(par.cell);
				
				if (par.loop) {
					cell.first = cell.eq(0);
					cell.last = cell.eq(cell.length - 1);

					switch (par.direction.toLowerCase()) {
						case "up":
							if (cell.first.height() === 0) {
								setTimeout(function() {
									slider(par);
								}, 200);
								return false;
							}
							cell.first.animate({
								marginTop: -1 * cell.first.innerHeight() - def.verticalMargin
							}, {
								// 途中で止まっていた場合は残りを調整してanimateし、次以降は再ループさせる。
								duration: ~~Math.abs(par.time / par.sp * cell.first.height() * 
									(cell.first.offset().top - par.guide.parent().offset().top < 0 ? 
										(cell.first.height() + cell.first.offset().top - par.guide.parent().offset().top) / cell.first.height() : 1
									)
								),
								easing: par.easing,
								complete: function() {
									if (par.loop) {
										cell.first.appendTo(par.guide).css("marginTop", 0);
										if (!par.once) slider(par);
									}
								}
							});
							break;
						case "down":
							if (cell.first.height() === 0) {
								setTimeout(function() {
									slider(par);
								}, 200);
								return false;
							}
							if (cell.first.offset().top - par.guide.parent().offset().top < 0) {
								cell.first.animate({
									marginTop: 0
								},{
									duration: ~~Math.abs(par.time / par.sp * cell.first.height() * 
										(cell.first.offset().top - par.guide.parent().offset().top < 0 ? 
											(par.guide.parent().offset().top - cell.first.offset().top) / cell.first.height() : 1
										)
									),
									easing: par.easing,
									complete: function() { if (!par.once) slider(par); }
								});
							} else {
								cell.last.prependTo(par.guide).css("marginTop", -1 * cell.last.innerHeight() - def.verticalMargin);
								slider(par);
							}
							break;
						case "left":
							cell.first.animate({
								marginLeft: -1 * cell.first.innerWidth() - par.horizontalMargin
							}, {
								// 途中で止まっていた場合は残りを調整してanimateし、次以降は再ループさせる。
								duration: ~~Math.abs(par.time / par.sp * cell.first.width() * 
									(cell.first.offset().left - par.guide.offset().left < 0 ? 
										(cell.first.width() + cell.first.offset().left - par.guide.offset().left) / cell.first.width() : 1
									)
								),
								easing: par.easing,
								complete: function() {
									if (par.loop) {
										cell.first.appendTo(par.guide).css("marginLeft", 0);
										if (!par.once) slider(par);
									}
								}
							});
							break;
						case "right":
							if (cell.first.offset().left - par.guide.offset().left < 0) {
								cell.first.animate({
									marginLeft: 0
								},{
									duration: ~~Math.abs(par.time / par.sp * cell.first.width() * 
										(cell.first.offset().left - par.guide.offset().left < 0 ? 
											(par.guide.offset().left - cell.first.offset().left) / cell.first.width() : 1
										)
									),
									easing: par.easing,
									complete: function() { if (!par.once) slider(par); }
								});
							} else {
								cell.last.prependTo(par.guide).css("marginLeft", -1 * cell.last.innerWidth() - par.horizontalMargin);
								slider(par);
							}
							break;
						default:
							return false;
					}
				
				} else { // ループしない時
					// コントローラの表示
					var ctrl = par.guide.siblings(par.ctrl);
					ctrl.show();
					// 方向の取得
					var d = 0;
					switch (par.direction.toLowerCase()) {
						case "up":
						case "down":
							d = par.direction.toLowerCase() === "up" ?  -1 : 1;
							// スライド設定
							par.guide.animate({
								marginTop: par.guide.height() * d
							}, {
								duration: par.time * par.guide.height() / par.sp,
								easing: par.easing
							});
							// 停止設定
							var gl = par.guide.offset().top;
							var fl = par.guide.parent().offset().top;
							var timerId = setInterval(function() {
								if (d > 0 && par.guide.offset().top > par.guide.parent().offset().top + par.frameBorder) {
									clearInterval(timerId);
									par.guide.stop(true);
									ctrl.filter(".up").hide();
								}
								if (d < 0 && par.guide.parent().height() + par.guide.parent().offset().top + par.frameBorder + par.verticalMargin > par.guide.height() + par.guide.offset().top) {
									clearInterval(timerId);
									par.guide.stop(true);
									ctrl.filter(".down").hide();
								}
							}, 20);
							break;
						case "left":
						case "right":
						default:
							d = par.direction.toLowerCase() === "left" ?  -1 : 1;
							// スライド設定
							par.guide.animate({
								marginLeft: par.guide.width() * d
							}, {
								duration: par.time * par.guide.width() / par.sp,
								easing: par.easing
							});
							// 停止設定
							var gl = par.guide.offset().left;
							var fl = par.guide.parent().offset().left;
							var timerId = setInterval(function() {
								if (d > 0 && par.guide.offset().left > par.guide.parent().offset().left + par.frameBorder) {
									clearInterval(timerId);
									par.guide.stop(true);
									ctrl.filter(".left").hide();
								}
								if (d < 0 && par.guide.parent().width() + par.guide.parent().offset().left + par.frameBorder + par.horizontalMargin > par.guide.width() + par.guide.offset().left) {
									clearInterval(timerId);
									par.guide.stop(true);
									ctrl.filter(".right").hide();
								}
							}, 20);
							break;
					}
				}
			}

			// 実行設定 ------------------------------- //

			// 幅の初期設定
			if (def.build) {
				$(window).resize(function() {
					clearTimeout(initTimerId);
					initTimerId = setTimeout(function() {
						init(def);
					}, 100);
				}).triggerHandler("resize");
			}

			// 自動起動
			if (def.auto) slider(def);

			// オプション設定 ------------------------- //

			// マウスオーバーで一時停止する
			if (def.pause) {
				def.guide.hover(
					function() { $(this).find(def.cell).stop(true); },
					function() { slider(def); }
				);
			}
			
			// コントローラ設定 ------------------------- //

			// ホバーイベント
			if (def.ctrlHover) {
				// for mobile
				if (mobile) {
					def.guide.siblings(def.ctrl)
						.bind(def.handlerMousedown, function(event) {
							event.preventDefault();
							def.guide.find(def.cell).stop(true);
							def.sp = def.speed;
							switch (true) {
								case $(this).hasClass("right"):
									def.direction = "right";
									break;
								case $(this).hasClass("up"):
									def.direction = "up";
									break;
								case $(this).hasClass("down"):
									def.direction = "down";
									break;
								case $(this).hasClass("left"):
								default:
								   def.direction = "left";
							}
							slider(def);
						}).bind(def.handlerMouseup, function() {
							def.guide.find(def.cell).stop(true);
							def.sp = 1;
							def.direction = def.d;
							if (def.auto) slider(def);
						});
				} else {
					// 早送り・巻き戻し
					def.guide.siblings(def.ctrl).hover(
						function() {
							def.guide.stop(true).find(def.cell).stop(true);
							def.sp = def.speed;
							def.direction = $(this).hasClass("right") ? def.reverse ? "left" : "right" : def.reverse ? "right" : "left";
							switch (true) {
								case $(this).hasClass("right"):
									def.direction = def.reverse ? "left" : "right";
									break;
								case $(this).hasClass("up"):
									def.direction = def.reverse ? "down" : "up";
									break;
								case $(this).hasClass("down"):
									def.direction = def.reverse ? "up" : "down";
									break;
								case $(this).hasClass("left"):
								default:
									def.direction = def.reverse ? "right" : "left";
							}
							slider(def);
						},
						function() {
							def.guide.stop(true).find(def.cell).stop(true);
							def.sp = 1;
							def.direction = def.d;
							if (def.auto) slider(def);
						}
					);
				}
			}
			
			// クリックイベント
			if (def.ctrlClick) {
				def.guide.siblings(def.ctrl).bind(def.handlerMousedown, function(event) {
					// アニメーションを省略
					def.guide.find(def.cell).stop(true, true);
					// 初期動作の中止
					event.preventDefault();
					// 方向設定
						def.direction = $(this).hasClass("right") ? def.reverse ? "left" : "right" : def.reverse ? "right" : "left";
					// 1クリックで1コマだけ動くようにする
					def.once = true;
					slider(def);
					if (def.restart) {
						setTimeout(function() {
							def.once = false;
							slider(def);
						}, def.restartTime);
					}
				});
			}

			// ドラッグイベント
			// dragmove設定
			var dragmove = function(event) {
				var frameEnd = def.guide.parent().width() + def.guide.parent().position().left;
				var guideEnd = def.guide.width() + def.guide.position().left;
				var stuff = 100;

				def.guide.css("position", "absolute").css("left", (mobile ? event.originalEvent.touches[0].pageX : event.pageX) - def.mousedownX);

				if (frameEnd - guideEnd > stuff || def.guide.offset().left - def.guide.parent().offset().left > stuff) {
					$(document).unbind(def.handlerMousemove, dragmove).one(def.handlerMouseup, function() {
						def.guide.animate({
							left: frameEnd - guideEnd > stuff ? "+=" + (frameEnd - guideEnd) : 0
						}, {
							duration: 500,
							easing: "easeOutQuart"
						});
					});
				}
			}
			if (def.draggable) {
				def.guide.bind(def.handlerMousedown, function(event) {
					event.preventDefault();
					def.mousedownX = (mobile ? event.originalEvent.touches[0].pageX : event.pageX) - def.guide.position().left;
					$(this).stop(true).css("cursor", def.curClose);
					$(document).bind(def.handlerMousemove, dragmove);
				});
				$(document).bind(def.handlerMouseup, function() {
					def.guide.css("cursor", def.curOpen);
					$(document).unbind(def.handlerMousemove, dragmove);
				});
			}
			
		});
	}; // slider end

}(jQuery));
