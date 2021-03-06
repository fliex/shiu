/* global iScroll */
// AppUi
(function () {
	'use strict';
	var AppUi = {
		//类成员
		$heroUnit: $('#hero_unit'),
		$alert: $('#alert'),
		$temp: $('#temp'),
		CHAPTER_SELECTOR: '#content .chapter',
		$chapter: null, // 章 dom节点，修改后需要重新载入
		SCREEN_WIDTH: 320, // 默认宽度
		SCREEN_HEIGHT: 480, // 默认高度
		SCREEN_PADDING: 8,
		SCREEN_BOTTOM_HEIGHT: 10,
		SCREEN_COLUMN_GAP: 12, // 默认分栏页面间隔

        init: function (app) {
			var self = this;
			self.app = app;
			self.setScreen();
		},

		// 浏览模式
		displayHeroUnit: function () {
			this.$heroUnit.show();
		},

		displayDownload: function () {
			this.$heroUnit.find('.book_desc').css('height', '120px');
			$('#download').show();
		},

		displayStandalone: function () {
			var self = this,
				p = window.shiu.ui;
			$("body").bind('touchmove', function (e) { // 静止触摸反弹
				e.preventDefault();
			});
			self.sidebar = Object.create(p.Sidebar).init('#sidebar', self);
			self.buttons = Object.create(p.Buttons).init('#sidebar .buttons', self);
			self.content = Object.create(window.shiu.ui.Content).init('#content', self);
			self.$heroUnit.one('click', function () {
				self.app.startRead();
				self.content.bindScroll(); // 延迟绑定
			});
		},

		displayRead: function () {
			this.$heroUnit.hide();
			$('#main').show();
		},

		// 设定横屏 / 适应尺寸 // TODO
		setScreen: function (isOrientation) {
			isOrientation = isOrientation || false;
			var x = window.screen.width,
				y = document.body.scrollHeight;
			if (isOrientation) {
				this.SCREEN_WIDTH = y;
				this.SCREEN_HEIGHT = x;
			} else {
				this.SCREEN_WIDTH = x;
				this.SCREEN_HEIGHT = y;
			}
			//this.setPage(0);
		},

		// 更新下载百分比
		updateDownloadPercent: function (percent) {
			$("#download .percent").text(percent);
		},

		// 下载完成
		updateDownloadComplete: function () {
			this.updateDownloadPercent(100);
			$("#download .tip").text("下载完成");
			$("#download .complete").show();
		},

		alert: function (message, level, delay) {
			var self = this;
			if (level === 'disable') {
				self.$alert.hide();
				self.$alert.children().html('').removeClass();
				return;
			}
			self.$alert.show();
			self.$alert.children().html(message).addClass(level);
			if (delay === undefined) {
				$('body').one('click', function () {
					self.$alert.hide();
					self.$alert.children().html('').removeClass();
				});
			} else {
				setTimeout(function () {
					self.$alert.hide();
					self.$alert.children().html('').removeClass();
				}, 3000);
			}
		},

		setChapter: function (html) {
			this.content.setChapter(html);
		},

		// 设定当前页面到指定页数
		setPage: function (page) {
			this.content.setPage(page);
		},

		// 获取章节总页码
		getPageCount: function () {
			return this.content.getPageCount();
		}
	};

	window.shiu.ui.AppUi = AppUi;
}());

// 侧边栏
(function () {
	'use strict';
	var Sidebar = {

		init: function (selector, ui) {
			var self = this;
			self.$ = $(selector);
			self.ui = ui;
			self.$indexs = $('#indexs');
			self.initIndexs();
			self.bindTouchStart();
			self.bindAClick();
			$('#index_wrapper').css('height', (self.ui.SCREEN_HEIGHT) + 'px');
			return self;
		},

		initIndexs: function () {
			var self = this;
			self.ui.$temp.html(self.ui.app.book.getIndexsHtml());
			self.$indexs.append(self.ui.$temp.children());
		},

		// 目录滚动
		bindIndexsScroll: function () {
			this.iScroll = new iScroll('index_wrapper', {});
		},

		fadeX: function (x) {
			this.$.css('-webkit-transform', 'translate3d(' + x + 'px, 0, 0)');
			this.$.css('-moz-transform', 'translate3d(' + x + 'px, 0, 0)');
		},

		hide: function () { // TODO 设计成分状态隐藏
			this.fadeX(0);
			this.$.css('background', 'none');
		},

		show: function () {
			if (this.iScroll === undefined) {
				this.bindIndexsScroll(); // 延迟绑定
			}
			this.fadeX(320);
			this.$.css('background', 'transparent');
		},

		isVisiable: function () {
			return this.$.offset().left >= 0;
		},

		toggle: function () {
			if (this.isVisiable()) {
				this.hide();
			} else {
				this.show();
			}
		},

		bindTouchStart: function () {
			var self = this;
			self.$.bind('touchstart', function (e) {
				if (e.touches[0].clientX - self.$.offset().left > 280) {
					self.hide();
					return false;
				}
			});
		},

		bindAClick: function () {
			var self = this;
			self.$.find('#indexs li a').click(function (e) {
				self.ui.app.book.setCurrentChapterIndex(parseInt(this.rel, 10));
				self.ui.app.setChapter();
				self.hide();
			});
		}

	};

	window.shiu.ui.Sidebar = Sidebar;
}());

// 菜单按钮
(function () {
	'use strict';
	var Buttons = {

		init: function (selector, ui) {
			var self = this;
			self.$ = $(selector);
			self.$index = $(selector).children('.index_btn');
			self.$fontZi = $(selector).children('.font_zi_btn');
			self.$fontZo = $(selector).children('.font_zo_btn');
			self.ui = ui;
			self.bindTouchStart();
			return self;
		},

		hide: function () {
			this.ui.sidebar.hide();
		},

		show: function () {
			this.ui.sidebar.fadeX(40);
		},

		isVisiable: function () {
			// Mozilla 这时 left 会误判
			return this.ui.sidebar.$.offset().left >= -280;
		},

		toggle: function () {
			if (this.isVisiable()) {
				this.hide();
			} else {
				this.show();
			}
		},

		bindTouchStart: function () {
			var self = this;
			self.$index.bind('touchstart', function (e) {
				self.ui.sidebar.toggle();
				e.stopPropagation();
				return false;
			});
			self.$fontZi.bind('touchstart', function (e) {
				self.ui.content.incFontSize();
				e.stopPropagation();
				return false;
			});
			self.$fontZo.bind('touchstart', function (e) {
				self.ui.content.decFontSize();
				e.stopPropagation();
				return false;
			});
		},

		bindDragEnd: function () { // TODO 暂时不用
			var self = this;
			self.$index.ondragend = function (e) {
				self.ui.sidebar.show();
			};
		}

	};

	window.shiu.ui.Buttons = Buttons;
}());

// 书籍内容模块 Content
(function () {
	'use strict';
	var Content = {

		CHAPTER_SELECTOR: '#content .chapter',

		init: function (selector, ui) {
			var self = this;
			self.ui = ui;
			self.$ = $(selector);
			self.$chapter = $(selector).find('.chapter');
			self.isTouchEvent = false;
			self.isTouchLock = false;
			self.$.css('height', self.ui.SCREEN_HEIGHT + 'px');
			self.bindClick();
			return self;
		},

		bindClick: function () {
			var self = this;
			self.$.click(function (e) {
				var x = e.clientX,
					y = e.clientY;
				if (!self.isTouchEvent) {
					if (x < self.ui.SCREEN_WIDTH * 0.25) {
						self.ui.app.prePage();
						self.ui.buttons.hide();
					} else if (x > self.ui.SCREEN_WIDTH * 0.75) {
						self.ui.app.nextPage();
						self.ui.buttons.hide();
					} else {
						self.ui.buttons.toggle();
					}
				}
			});
		},

		bindScroll: function () {
			var self = this;

			self.$.bind('touchstart', function (e) {
				self.startX = e.touches[0].pageX;
				self.startLeft = self.$chapter.offset().left;
			});

			self.$.bind('touchmove', function (e) {
				if (self.isTouchLock) { // 锁住
					return false;
				}
				self.isTouchLock = true;
				if (e.touches.length > 1) {
					return false;
				}
				self.transformX(self.startLeft
					- self.startX + e.touches[0].pageX);
				self.isTouchLock = false;
				//console.log('move: ' + e.touches[0].pageX);
			});

			self.$.bind('touchend', function (e) {
				var offset = e.changedTouches[0].pageX - self.startX;
				self.isTouchEvent = true;
				if (offset < 0 && Math.abs(offset) >= 60) {
					if (!self.ui.app.nextPage()) { // 判断是否有下一章
						self.transformX(self.startLeft);
					}
				} else if (offset > 0 && Math.abs(offset) >= 60) {
					if (!self.ui.app.prePage()) {
						self.transformX(self.startLeft);
					}
				} else {
					if (Math.abs(offset) < 10) { // 单击事件
						self.isTouchEvent = false;
					}
					self.transformX(self.startLeft); // 回退
				}
			});

			self.$.bind('touchcancel', function (e) {
				self.transformX(self.startLeft);
				return false;
			});
		},

		transformX: function (x) {
			this.$chapter.css('-webkit-transform', 'translate3d(' +
				x + 'px, 0, 0)'); // 硬件加速
			this.$chapter.css('-moz-transform', 'translate3d(' +
				x + 'px, 0, 0)');
		},

		setChapter: function (html) {
			var self = this;
			self.ui.app.info('载入中…', true);
			self.ui.$temp.html(html);
			self.$.children().remove();
			self.$.append(self.ui.$temp.children());
			self.$chapter = $(self.CHAPTER_SELECTOR);
			self.$chapter.css('height',
				(self.ui.SCREEN_HEIGHT - self.ui.SCREEN_BOTTOM_HEIGHT) + 'px');
			self.$chapter.css('-webkit-column-width', self.ui.SCREEN_WIDTH + 'px');
			self.$chapter.children('p').css('font-size', self.ui.app.book.getFontSize());
		},

		setPage: function (page) {
			var self = this,
				left = -(page * (self.ui.SCREEN_WIDTH + self.ui.SCREEN_COLUMN_GAP));
			self.transformX(left);
		},

		getPageCount: function () {
			return ((this.$chapter.find('.end').offset().left -  this.$chapter.children().first().offset().left))
					/ (this.ui.SCREEN_WIDTH + this.ui.SCREEN_COLUMN_GAP)
					+ 1;
		},

		incFontSize: function () {
			var self = this,
				size = parseInt(self.$chapter.children('p').css('font-size'), 10);
			if (size < 32) {
				self.$chapter.children('p').css('font-size', (size + 2) + 'px');
			}
			self.ui.app.book.setPageCount(self.getPageCount());
			self.ui.app.book.setFontSize(size);
		},

		decFontSize: function () {
			var self = this,
				size = parseInt(self.$chapter.children('p').css('font-size'), 10);
			if (size > 12) {
				self.$chapter.children('p').css('font-size', (size - 2) + 'px');
			}
			self.ui.app.book.setPageCount(self.getPageCount());
			self.ui.app.book.setFontSize(size);
			
			// 过载保护
			if (self.ui.app.book.getPageCount() <= self.ui.app.book.getCurrentPage()) {
				self.ui.app.prePage();
			}
		}

	};

	window.shiu.ui.Content = Content;
}());
