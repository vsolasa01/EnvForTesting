var HdSolar;
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
(function (HdSolar) {
    var BaseAnchor = (function () {
        function BaseAnchor(config) {
            this.config = config;
            this.parent = config.parent;
            this.__init();
        }
        BaseAnchor.prototype.getGroup = function () {
            return this.parent.getGroup();
        };
        BaseAnchor.prototype.name = function () {
            return this.anchor.name();
        };
        BaseAnchor.prototype.x = function (x) {
            if (x == undefined)
                return this.anchor.x();
            else
                this.anchor.x(x);
        };
        BaseAnchor.prototype.y = function (y) {
            if (y == undefined)
                return this.anchor.y();
            else
                this.anchor.y(y);
        };
        BaseAnchor.prototype.getPosition = function () {
            return this.anchor.getPosition();
        };
        BaseAnchor.prototype.setPosition = function (pos) {
            this.anchor.setPosition(pos);
        };
        BaseAnchor.prototype.show = function () {
            this.anchor.show();
        };
        BaseAnchor.prototype.hide = function () {
            this.anchor.hide();
        };
        BaseAnchor.prototype.drawGraphics = function (group) { };
        BaseAnchor.prototype.onHover = function (isHoverIn) { };
        BaseAnchor.prototype.__init = function () {
            var me = this;
            var cfg = {
                x: this.config.position.x,
                y: this.config.position.y,
                name: this.config.name,
                draggable: true,
                dragOnTop: true
            };
            if (this.config.dragBoundFunc != null)
                cfg.dragBoundFunc = this.config.dragBoundFunc;
            if (this.config.dummy) {
                cfg.draggable = false;
                cfg.visible = false;
            }
            this.anchor = new Kinetic.Group(cfg);
            this.drawGraphics(this.anchor);
            this.anchor.on('mousedown touchstart', function () {
                me.parent.getNode().setDraggable(false);
                me.onHover(true);
                this.moveToTop();
            });
            this.anchor.on('mouseover', function () {
                var layer = this.getLayer();
                document.body.style.cursor = 'pointer';
                me.onHover(true);
                layer.draw();
            });
            this.anchor.on('mouseout', function () {
                var layer = this.getLayer();
                document.body.style.cursor = 'default';
                me.onHover(false);
                layer.draw();
            });
            this.anchor.on('dragend', function () {
                me.parent.getNode().setDraggable(true);
                document.body.style.cursor = 'default';
                if (me.config.positionCallbackFunc != null) {
                    var p = me.config.positionCallbackFunc();
                    (new Kinetic.Tween({
                        node: me.anchor,
                        duration: 0.3,
                        x: p.x,
                        y: p.y
                    })).play();
                }
            });
            this.parent.getGroup().add(this.anchor);
        };
        return BaseAnchor;
    })();
    HdSolar.BaseAnchor = BaseAnchor;
    var Anchor = (function (_super) {
        __extends(Anchor, _super);
        function Anchor(config) {
            if (config.fill == null)
                config.fill = 'white';
            if (config.dummy == null)
                config.dummy = false;
            _super.call(this, config);
            this.init();
        }
        Anchor.prototype.update = function () {
            this.parent.update(this);
        };
        Anchor.prototype.drawGraphics = function (group) {
            var cfg = {
                stroke: 'black',
                fill: this.config.fill,
                strokeWidth: 1,
                radius: 5
            };
            this.circle = new Kinetic.Circle(cfg);
            this.anchor.add(this.circle);
        };
        Anchor.prototype.onHover = function (isHoverIn) {
            this.circle.setStrokeWidth(isHoverIn ? 2 : 1);
            this.circle.setStroke(isHoverIn ? 'red' : 'black');
        };
        Anchor.prototype.init = function () {
            var me = this;
            this.anchor.on('dragmove', function () {
                var layer = this.getLayer();
                me.update();
                layer.draw();
            });
            this.anchor.on('mousedown touchstart', function () {
                me.parent.getGroup().setDraggable(false);
                this.moveToTop();
            });
        };
        return Anchor;
    })(BaseAnchor);
    HdSolar.Anchor = Anchor;
})(HdSolar || (HdSolar = {}));
(function (HdSolar) {
    var RotateWheel = (function () {
        function RotateWheel(layer, position) {
            this.anchorRadius = 6;
            this.outerRadius = 35;
            this.group = null;
            this.controlGroup = null;
            this.onValueChanging = function (value) {
            };
            this.onValueChanged = function (value) {
            };
            var m = this;
            var stage = layer.getStage();
            this.group = new Kinetic.Group(position);
            layer.add(this.group);
            var circleConfig = {
                x: this.group.getOffset().x, y: this.group.getOffset().y, fill: 'green', opacity: 0.5, radius: 10,
            };
            var center = new Kinetic.Circle(circleConfig);
            this.group.add(center);
            var oc2Config = {
                x: circleConfig.x, y: circleConfig.y,
                fill: 'black', radius: this.outerRadius,
                fillPriority: 'radial-gradient',
                fillRadialGradientStartRadius: 0,
                fillRadialGradientEndRadius: this.outerRadius,
                fillRadialGradientColorStops: [0, '#D8D8D8', 0.5, '#707070', 0.95, '#C8C8C8', 1, 'grey'],
            };
            var o2circle = new Kinetic.Circle(oc2Config);
            this.group.add(o2circle);
            if (false) {
                var ocConfig = {
                    x: circleConfig.x, y: circleConfig.y, stroke: 'red',
                    fill: 'white',
                    opacity: 0.9, radius: this.outerRadius - 2 * this.anchorRadius,
                    fillPriority: 'radial-gradient',
                    fillRadialGradientStartRadius: 0,
                    fillRadialGradientEndRadius: this.outerRadius - 2 * this.anchorRadius,
                    fillRadialGradientColorStops: [0, 'brown', 0.4, 'white', 0.7, 'grey', 1, 'black'],
                };
                var ocircle = new Kinetic.Circle(ocConfig);
                this.group.add(ocircle);
            }
            var l1 = new Kinetic.Line({
                stroke: 'black', strokeWidth: 2, listening: false,
                points: [circleConfig.x - 9, circleConfig.y, circleConfig.x + 9, circleConfig.y]
            });
            this.group.add(l1);
            var l2 = new Kinetic.Line({
                stroke: 'black', strokeWidth: 2, listening: false,
                points: [circleConfig.x, circleConfig.y - 9, circleConfig.x, circleConfig.y + 9]
            });
            this.group.add(l2);
            var text = new Kinetic.Text({
                fill: 'blue', text: 'N', scale: { x: 1, y: 1 }
            });
            text.on('mouseover', function () {
                document.body.style.cursor = 'pointer';
                this.fill('#66CCFF');
                layer.draw();
            });
            text.on('mouseout', function () {
                document.body.style.cursor = 'default';
                this.fill('blue');
                layer.draw();
            });
            text.on('click', function () {
                var t = setInterval(function () {
                    var r = m.group.getRotationDeg();
                    if (r > 0) {
                        r -= 5;
                        if (r < 0)
                            r = 0;
                    }
                    else if (r < 0) {
                        r += 5;
                        if (r > 0)
                            r = 0;
                    }
                    m.setRotationDeg(r);
                    layer.draw();
                    if (r == 0) {
                        clearInterval(t);
                    }
                }, 16);
            });
            this.group.add(text);
            var tx = text.getWidth();
            text.setPosition({ x: -tx / 2, y: -20 });
            var controlGroupConfig = {
                x: this.group.getPosition().x + this.outerRadius - this.anchorRadius,
                y: this.group.getPosition().y,
                opacity: 1, draggable: true,
            };
            controlGroupConfig.dragBoundFunc = function (pos) {
                var groupPos = m.group.getPosition();
                var rotation = HdSolar.Utils.degrees(HdSolar.Utils.angle(groupPos.x, groupPos.y, pos.x, pos.y));
                var dis = HdSolar.Utils.distance(groupPos.x, groupPos.y, pos.x, pos.y);
                m.group.setRotationDeg(rotation);
                layer.draw();
                return pos;
            };
            this.controlGroup = new Kinetic.Group(controlGroupConfig);
            layer.add(this.controlGroup);
            var rotator = new Kinetic.Circle({
                x: 0, y: 0,
                fill: 'red',
                opacity: 1,
                radius: this.anchorRadius,
                stroke: 'black',
                strokeWidth: 0.5,
                fillPriority: 'radial-gradient',
                fillRadialGradientStartRadius: 0,
                fillRadialGradientEndRadius: this.anchorRadius,
                fillRadialGradientColorStops: [0, 'white', 0.7, '#707070', 1, 'grey']
            });
            this.controlGroup.add(rotator);
            rotator.on('mouseover', function () {
                document.body.style.cursor = 'pointer';
                this.setStrokeWidth(1);
                this.getLayer().draw();
            });
            rotator.on('mouseout', function () {
                document.body.style.cursor = 'default';
                this.strokeWidth(0.5);
                this.getLayer().draw();
            });
            this.controlGroup.on('dragend', function () {
                var radius = m.outerRadius - m.anchorRadius, angle = HdSolar.Utils.radians(m.group.getRotation()), groupPos = m.group.getPosition();
                var tween = new Kinetic.Tween({
                    node: m.controlGroup,
                    duration: 0.3,
                    x: groupPos.x + radius * Math.cos(angle),
                    y: groupPos.y + radius * Math.sin(angle),
                });
                tween.play();
                if (m.onValueChanged != undefined) {
                    m.onValueChanged(m.group.getRotationDeg());
                }
            });
            this.controlGroup.on("dragmove", function () {
                if (m.onValueChanging != undefined) {
                    m.onValueChanging(m.group.getRotationDeg());
                }
            });
            layer.draw();
        }
        RotateWheel.prototype.setRotationDeg = function (r) {
            this.group.setRotationDeg(r);
            var radius = this.outerRadius - this.anchorRadius, angle = HdSolar.Utils.radians(this.group.getRotation()), groupPos = this.group.getPosition();
            this.controlGroup.setPosition({
                x: groupPos.x + radius * Math.cos(angle),
                y: groupPos.y + radius * Math.sin(angle),
            });
            this.onValueChanging(r);
            this.onValueChanged(r);
        };
        return RotateWheel;
    })();
    HdSolar.RotateWheel = RotateWheel;
    var PanelStock = (function () {
        function PanelStock(layer, position) {
            this.panelInfo = { width: 28, height: 17 };
            this.onAddPanelShape = function (position) {
            };
            this.layer = layer;
            var m = this;
            var stage = layer.getStage();
            this.group = new Kinetic.Group({
                x: position.x,
                y: position.y,
                draggable: false
            });
            this.layer.add(this.group);
            this.boundRect = new Kinetic.Rect({
                stroke: 'red',
                width: this.panelInfo.width * 2,
                height: this.panelInfo.height * 2,
            });
            this.boundRect.on("mouseover", function () {
                var r = this;
                r.setStrokeWidth(2);
                m.layer.draw();
            });
            this.boundRect.on("mouseout", function () {
                var r = this;
                r.setStrokeWidth(1);
                m.layer.draw();
            });
            this.group.add(this.boundRect);
            this.dragGroup = new Kinetic.Group({
                x: this.boundRect.x(),
                y: this.boundRect.y(),
                width: this.boundRect.width(),
                height: this.boundRect.height(),
                draggable: true
            });
            this.dragRect = new Kinetic.Rect({
                x: 0,
                y: 0,
                stroke: 'red',
                width: this.boundRect.width(),
                height: this.boundRect.height(),
                opacity: 0.5,
                draggable: false
            });
            this.group.on("mouseover", function () {
                var r = m.boundRect;
                document.body.style.cursor = 'pointer';
                r.setStrokeWidth(3);
                m.layer.draw();
            });
            this.group.on("mouseout", function () {
                var r = m.boundRect;
                document.body.style.cursor = 'default';
                r.setStrokeWidth(1);
                m.layer.draw();
            });
            this.dragGroup.on("dragend", function (evtarg) {
                m.dropOnMap(evtarg.evt);
            });
            this.dragGroup.add(this.dragRect);
            this.group.add(this.dragGroup);
            this.drawPanels();
            this.layer.draw();
        }
        PanelStock.prototype.createDragRect = function () {
            if (this.dragRect != null) {
                this.dragRect.destroy();
            }
            this.dragRect = new Kinetic.Rect({
                x: 0,
                y: 0,
                stroke: 'blue',
                fill: 'violet',
                width: this.boundRect.width(),
                height: this.boundRect.height(),
                opacity: 1,
                draggable: true
            });
            this.group.add(this.dragRect);
            this.layer.draw();
        };
        PanelStock.prototype.dropOnMap = function (evtarg) {
            var pos = {
                x: evtarg.layerX,
                y: evtarg.layerY
            };
            var apos = this.dragGroup.getAbsolutePosition();
            this.dragGroup.setPosition({ x: 0, y: 0 });
            this.layer.draw();
            this.onAddPanelShape(apos);
        };
        PanelStock.prototype.drawPanels = function () {
            var pi = this.panelInfo;
            var groupSize = this.dragGroup.getSize();
            var col = Math.round(groupSize.width / pi.width);
            var row = Math.round(groupSize.height / pi.height);
            var panelImages = [];
            var loadedImages = 0;
            var numImages = row * col;
            var that = this;
            for (var r = 0; r < numImages; r++) {
                panelImages[r] = new Image();
                panelImages[r].onload = function () {
                    if (++loadedImages >= numImages) {
                        that.panelImageLoaded(panelImages, row, col);
                    }
                };
                panelImages[r].src = 'data:image/png;base64,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';
            }
        };
        PanelStock.prototype.panelImageLoaded = function (panelImages, row, col) {
            var pi = this.panelInfo;
            for (var r = 0; r < row; r++) {
                for (var c = 0; c < col; c++) {
                    var kimg = new Kinetic.Image({
                        x: pi.width * c,
                        y: pi.height * r,
                        image: panelImages[r * col + c],
                        width: pi.width,
                        height: pi.height,
                        opacity: 1,
                        name: 'panel'
                    });
                    this.dragGroup.add(kimg);
                }
            }
            this.layer.draw();
        };
        return PanelStock;
    })();
    HdSolar.PanelStock = PanelStock;
    var ZoomRect = (function () {
        function ZoomRect(group, position, isZoomIn, width) {
            this.e = true;
            this.p = true;
            this.ls = new Array();
            this.onClick = function (evt) { };
            this.group = group;
            var m = this;
            var bound = {
                x: position.x,
                y: position.y,
                width: width,
                height: width,
            };
            this.p = isZoomIn;
            var rcfg = bound;
            var r = new Kinetic.Rect({
                x: position.x,
                y: position.y,
                fill: '#999999',
                stroke: 'gray',
                strokeWidth: 1,
                width: width,
                height: width,
            });
            var off = 6;
            var y = position.y + width / 2;
            var x1 = position.x + off, x2 = position.x + width - off;
            var l1 = new Kinetic.Line({ stroke: 'blue', strokeWidth: 3, listening: false, points: [x1, y, x2, y] });
            this.ls.push(l1);
            if (this.p) {
                var x = position.x + width / 2;
                var y1 = position.y + off, y2 = position.y + width - off;
                var l2 = new Kinetic.Line({ stroke: 'blue', strokeWidth: 3, listening: false, points: [x, y1, x, y2] });
                this.ls.push(l2);
            }
            r.on("mouseover", function () { if (m.e)
                m.onMouseOver(r); });
            r.on("mouseout", function () { m.onMouseOut(r); });
            r.on("click", function (data) { if (m.e)
                m.onClick(data); });
            r.on("mousedown", function () {
                if (m.e) {
                    r.setFill('#3CB371');
                    m.group.getLayer().draw();
                }
            });
            r.on("mouseup", function () {
                if (m.e) {
                    r.setFill('white');
                    m.group.getLayer().draw();
                }
            });
            group.add(r);
            this.ls.forEach(function (v) { group.add(v); });
        }
        ZoomRect.prototype.onMouseOver = function (r) {
            document.body.style.cursor = 'pointer';
            r.setStrokeWidth(2);
            r.setFill('white');
            this.ls.forEach(function (v) { v.setStrokeWidth(3.5); });
            this.group.getLayer().draw();
        };
        ZoomRect.prototype.onMouseOut = function (r) {
            document.body.style.cursor = 'default';
            r.setStrokeWidth(1);
            r.setFill('#999999');
            this.ls.forEach(function (v) { v.setStrokeWidth(3); });
            this.group.getLayer().draw();
        };
        ZoomRect.prototype.enable = function (en) {
            this.e = en;
        };
        return ZoomRect;
    })();
    var ZoomControl = (function () {
        function ZoomControl(layer, position) {
            this.width = 25;
            this.height = this.width * 2;
            this.cp = null;
            this.cm = null;
            this.onZoomIn = function () { };
            this.onZoomOut = function () { };
            this.layer = layer;
            var that = this;
            var stage = layer.getStage();
            this.group = new Kinetic.Group({
                x: position.x,
                y: position.y,
                draggable: false
            });
            this.layer.add(this.group);
            this.cp = new ZoomRect(this.group, { x: 0, y: 0 }, true, this.width);
            this.cm = new ZoomRect(this.group, { x: 0, y: this.width }, false, this.width);
            this.cp.onClick = function (data) { that.onZoomIn(); that.enableZoomOut(true); };
            this.cm.onClick = function (data) { that.onZoomOut(); that.enableZoomIn(true); };
            this.layer.draw();
        }
        ZoomControl.prototype.enableZoomIn = function (en) {
            this.cp.enable(en);
        };
        ZoomControl.prototype.enableZoomOut = function (en) {
            this.cm.enable(en);
        };
        return ZoomControl;
    })();
    HdSolar.ZoomControl = ZoomControl;
    var MapTile = (function () {
        function MapTile(parent, cfg) {
            this._durl = "images/dtl.png";
            this.parent = parent;
            this.cfg = cfg;
            this._lot();
        }
        MapTile.prototype._lot = function (boi) {
            if (boi === void 0) { boi = false; }
            var m = this;
            if (m.cfg.image != null) {
                m.cfg.image.remove();
                m.cfg.image = null;
            }
            m.cfg.image = new Image();
            m.cfg.image.onload = function () {
                m._amt(m.cfg);
                m.probe();
            };
            if (boi) {
                var gghost = "https://maps.googleapis.com";
                var nurl = gghost + m.cfg.url;
                $.ajax({
                    type: 'POST',
                    url: '/api/signMapURL',
                    contentType: "application/json",
                    data: JSON.stringify({ url: nurl }),
                    headers: { 'x-okta-session-id': HdSolar.MapView.oktaID },
                    error: function (error) {
                        console.log(JSON.stringify(error));
                    }
                }).done(function (data) {
                    var surl = data.signedUrl;
                    m.cfg.image.src = surl.replace(gghost, "");
                });
            }
            else {
                m.cfg.image.src = m._durl;
            }
        };
        MapTile.prototype.probe = function () {
            if (this._oi != null)
                return;
            var w = 898;
            var x = this._di.getAbsolutePosition().x;
            var ex = x + HdSolar.MapView._TSZ;
            if ((x >= 0 && x <= w) || (ex >= 0 && ex <= w)) {
                var h = 500;
                var y = this._di.getAbsolutePosition().y;
                var ey = y + HdSolar.MapView._TSZ;
                if ((y >= 0 && y <= h) || (ey >= 0 && ey <= h)) {
                    this._lot(true);
                }
            }
        };
        MapTile.prototype._amt = function (t) {
            var m = this;
            var g = new Kinetic.Image({
                x: t.x,
                y: t.y,
                image: t.image,
                opacity: 0,
                width: HdSolar.MapView._TSZ,
                height: HdSolar.MapView._TSZ,
                crop: {
                    x: 0,
                    y: 0,
                    width: HdSolar.MapView._TSZ,
                    height: HdSolar.MapView._TSZ
                }
            });
            if (m._di == null) {
                m._di = g;
            }
            else {
                m._di.remove();
                m._di.destroy();
                m._oi = g;
            }
            this.parent.add(g);
            var tween = new Kinetic.Tween({
                node: g,
                duration: 0.6,
                opacity: 1,
                easing: Kinetic.Easings.EaseInOut
            });
            tween.play();
        };
        return MapTile;
    })();
    HdSolar.MapTile = MapTile;
})(HdSolar || (HdSolar = {}));
(function (HdSolar) {
    ;
    var Utils = (function () {
        function Utils() {
        }
        Utils.radians = function (degrees) { return degrees * (Math.PI / 180); };
        Utils.degrees = function (radians) { return radians * (180 / Math.PI); };
        Utils.angle = function (cx, cy, px, py) { var x = cx - px; var y = cy - py; return Math.atan2(-y, -x); };
        Utils.distance = function (p1x, p1y, p2x, p2y) { return Math.sqrt(Math.pow((p2x - p1x), 2) + Math.pow((p2y - p1y), 2)); };
        Utils.bound = function (value, opt_min, opt_max) {
            if (opt_min != null)
                value = Math.max(value, opt_min);
            if (opt_max != null)
                value = Math.min(value, opt_max);
            return value;
        };
        return Utils;
    })();
    HdSolar.Utils = Utils;
    (function (MapType) {
        MapType[MapType["Google"] = 1] = "Google";
        MapType[MapType["Nearmap"] = 2] = "Nearmap";
    })(HdSolar.MapType || (HdSolar.MapType = {}));
    var MapType = HdSolar.MapType;
    var MercatorProjection = (function () {
        function MercatorProjection(TILE_SIZE) {
            this.pixelOrigin_ = new google.maps.Point(TILE_SIZE / 2, TILE_SIZE / 2);
            this.pixelsPerLonDegree_ = TILE_SIZE / 360;
            this.pixelsPerLonRadian_ = TILE_SIZE / (2 * Math.PI);
        }
        MercatorProjection.prototype.fromLatLngToPoint = function (latLng, opt_point) {
            var point = opt_point || new google.maps.Point(0, 0);
            var origin = this.pixelOrigin_;
            point.x = origin.x + latLng.lng() * this.pixelsPerLonDegree_;
            var siny = Utils.bound(Math.sin(Utils.radians(latLng.lat())), -0.9999, 0.9999);
            point.y = origin.y + 0.5 * Math.log((1 + siny) / (1 - siny)) *
                -this.pixelsPerLonRadian_;
            return point;
        };
        MercatorProjection.prototype.fromPointToLatLng = function (point) {
            var me = this;
            var origin = me.pixelOrigin_;
            var lng = (point.x - origin.x) / me.pixelsPerLonDegree_;
            var latRadians = (point.y - origin.y) / -me.pixelsPerLonRadian_;
            var lat = Utils.degrees(2 * Math.atan(Math.exp(latRadians)) -
                Math.PI / 2);
            return new google.maps.LatLng(lat, lng);
        };
        return MercatorProjection;
    })();
    var MapView = (function () {
        function MapView(config) {
            this._ZL = { min: 18, max: 21 };
            this._z = 21;
            this._spid = 1;
            this._pss = new Array();
            this._cpi = { width: 1.65, height: 1.0, vgap: 0.0254, hgap: 0.0254 };
            this._isprt = false;
            this._ma = 100;
            this._bil = this._bilGoogleTiles;
            this._tiles = new Array();
            this._rszFct = 1.0;
            var me = this;
            this._cf = config;
            this._lat = config.lat;
            this._lng = config.lng;
            this._z = config.zoom;
            if (config.maxArray != null)
                this._ma = config.maxArray;
            var jqp = '#' + config.container;
            var width = $(jqp).width();
            if(config.container === 'qdMapPanel'){
                width = ($(document).width())*0.60;
            }
            var height = $(jqp).height();
            var stage = new Kinetic.Stage({
                container: config.container,
                width: width,
                height: height
            });
            $(window).resize(function () {
                stage.width($(jqp).width());
                stage.height($(jqp).height());
                if(config.container === 'qdMapPanel'){
                    stage.width(($(document).width())*0.60);
                }
            });
            var pos = { x: 0, y: 0 }, mrot = 0;
            if (config.worksData != null) {
                pos = config.worksData.olpos;
                mrot = config.worksData.mrot;
            }
            var olGrCfg = {
                draggable: true,
                position: pos,
                dragBoundFunc: function (p) {
                    var tpx = stage.getWidth() / 2, tpy = stage.getHeight() / 2;
                    var f = MapView._TSZ * 4;
                    var minX = -f + tpx, maxX = f + tpx, minY = -f + tpy, maxY = f + tpy;
                    var nx = p.x;
                    var ny = p.y;
                    if (nx < minX) {
                        nx = minX;
                    }
                    else if (nx > maxX) {
                        nx = maxX;
                    }
                    if (ny < minY) {
                        ny = minY;
                    }
                    else if (ny > maxY) {
                        ny = maxY;
                    }
                    return ({ x: nx, y: ny });
                }
            };
            this._olGroup = new Kinetic.Group(olGrCfg);
            this._olGroup.on('dragstart', function () { document.body.style.cursor = 'move'; });
            this._olGroup.on('dragend', function () {
                document.body.style.cursor = 'default';
                me._tiles.forEach(function (t) {
                    t.probe();
                });
            });
            this._mapGroup = new Kinetic.Group();
            this._olGroup.add(this._mapGroup);
            this._mapLayer = new Kinetic.Layer({ x: width / 2, y: height / 2, rotationDeg: mrot });
            this._mapLayer.add(this._olGroup);
            stage.add(this._mapLayer);
            stage.draw();
            this._ctlLayer = new Kinetic.Layer();
            stage.add(this._ctlLayer);
            this._rwh = new HdSolar.RotateWheel(this._ctlLayer, { x: 70, y: 70 });
            this._rwh.onValueChanging = function (r) {
                me._mapLayer.setRotationDeg(r);
                me._mapLayer.draw();
            };
            this._rwh.setRotationDeg(mrot);
            this._rwh.onValueChanged = function (r) {
                me._mapLayer.setRotationDeg(r);
                me._pss.forEach(function (v) { v.update2(); });
                me._mapLayer.draw();
            };
            if(config.container === 'qdMapPanel'){
                var pstock = new HdSolar.PanelStock(this._ctlLayer, { x: -10000, y: -1000 });
            }else{
                var pstock = new HdSolar.PanelStock(this._ctlLayer, { x: 43, y: 130 });
            }
            pstock.onAddPanelShape = function (pos) {
                if (me._pss.length >= me._ma)
                    return;
                var mpos = me._mapLayer.getPosition();
                var rpos = {
                    x: pos.x - mpos.x,
                    y: pos.y - mpos.y
                };
                me._ads(pos);
            };
            var zoomCtl = new HdSolar.ZoomControl(this._ctlLayer, { x: 60, y: 200 });
            zoomCtl.onZoomIn = function () {
                if (me._z < me._ZL.max) {
                    me._setMapTiles(me._bil(me._lat, me._lng, ++me._z));
                    me._pss.forEach(function (v) { v.changeZoom(true); });
                    if (me._z == me._ZL.max)
                        zoomCtl.enableZoomIn(false);
                }
            };
            zoomCtl.onZoomOut = function () {
                if (me._z > me._ZL.min) {
                    me._setMapTiles(me._bil(me._lat, me._lng, --me._z));
                    me._pss.forEach(function (v) { v.changeZoom(false); });
                    if (me._z == me._ZL.min)
                        zoomCtl.enableZoomOut(false);
                }
            };
            this._setMapTiles(this._bil(this._lat, this._lng, this._z));
        }
        MapView.prototype.setCurrPanelInfo = function (panelInfo) {
            this._cpi = panelInfo;
        };
        MapView.prototype._bilGoogleTiles = function (lat, lng, zoom) {
            var mapBase = "/maps/api/staticmap?client=gme-sunedisoninc&";
            var poffs = [200, 136, 4, 0];
            var s = this._mapLayer.getStage();
            var width = s.width();
            var height = s.height();
            var latlng = new google.maps.LatLng(lat, lng);
            var numTiles = 1 << zoom;
            var projection = new MercatorProjection(MapView._TSZ);
            var worldCoordinate = projection.fromLatLngToPoint(latlng);
            var pixelCoordinate = { x: worldCoordinate.x * numTiles, y: worldCoordinate.y * numTiles };
            var tileCoordinate = { x: Math.floor(pixelCoordinate.x / MapView._TSZ), y: Math.floor(pixelCoordinate.y / MapView._TSZ) };
            var start_coord = { x: tileCoordinate.x, y: tileCoordinate.y };
            var diagLen = (Math.sqrt(Math.pow(height, 2) + Math.pow(width, 2)));
            var tilesInLine = Math.ceil(diagLen / (MapView._TSZ)) + 2;
            var tileOffset = { x: pixelCoordinate.x % MapView._TSZ, y: pixelCoordinate.y % MapView._TSZ };
            var drawOffset = {
                x: -tileOffset.x,
                y: -tileOffset.y - poffs[zoom - this._ZL.min]
            };
            var sc = 1;
            var z = zoom;
            var f = MapView._TSZ / 256;
            var imageList = new Array();
            for (var r = -tilesInLine; r <= tilesInLine; r++) {
                for (var c = -tilesInLine; c <= tilesInLine; c++) {
                    var coord = { x: start_coord.x + (c * f), y: start_coord.y + (r * f) };
                    var tc = this._getNormalizedCoord(coord, zoom);
                    var wc = {
                        x: tc.x * MapView._TSZ / numTiles,
                        y: tc.y * MapView._TSZ / numTiles
                    };
                    var latlng = projection.fromPointToLatLng(new google.maps.Point(wc.x, wc.y));
                    var url = mapBase + "center=" + latlng.lat() + "," + latlng.lng() + "&zoom=" + z + "&size=" + MapView._TSZ + "x" + (MapView._TSZ + 20) + "&scale=" + sc + "&maptype=satellite";
                    var inf = { image: null, x: c * MapView._TSZ + drawOffset.x, y: r * MapView._TSZ + drawOffset.y, url: url };
                    inf.hash = Math.abs(r) + Math.abs(c) + (Math.abs(r) / 2);
                    imageList.push(inf);
                }
            }
            imageList.sort(function (a, b) {
                if (a.hash == b.hash)
                    return 0;
                if (a.hash < b.hash)
                    return -1;
                if (a.hash > b.hash)
                    return 1;
            });
            return imageList;
        };
        MapView.prototype._getNormalizedCoord = function (coord, zoom) {
            var y = coord.y;
            var x = coord.x;
            var tileRange = 1 << zoom;
            if (y < 0 || y >= tileRange) {
                return null;
            }
            if (x < 0 || x >= tileRange) {
                x = (x % tileRange + tileRange) % tileRange;
            }
            return {
                x: x,
                y: y
            };
        };
        MapView.prototype._setCfgHdlr = function (c) {
            var m = this;
            c.syncOrientation = this._cf.syncOrientation;
            c.onchange = function (o) {
                if (m._cf.onPanelInfoChanged != null)
                    m._cf.onPanelInfoChanged();
                if (m._hpc != null)
                    m._hpc(o.getId());
            };
            c.onrotate = function (o, deg) {
                if (m._hpc != null)
                    m._hpc(o.getId());
            };
            c.ondestroy = function (ob) {
                var j = m._pss.indexOf(ob);
                var bsl = ob.isSelected();
                if (j >= 0)
                    m._pss.splice(j, 1);
                if (m._hpd != null)
                    m._hpd(ob.getId());
                if (bsl && m._pss.length > 0) {
                    if (j >= m._pss.length)
                        j = m._pss.length - 1;
                    m._onclk(m._pss[j]);
                }
            };
            c.onclicked = function (s) { m._onclk(s); };
        };
        MapView.prototype.getPanelShapeCount = function () {
            return this._pss.length;
        };
        MapView.prototype.getPanelShapeInfo = function () {
            var arr = [];
            this._pss.forEach(function (o) {
                arr.push(o.getInfo());
            });
            return arr;
        };
        MapView.prototype.getPanelShapeInfoById = function (id) {
            if (id == null)
                throw "Please provide id";
            for (var i = 0; i < this._pss.length; i++) {
                var tid = this._pss[i].getId();
                if (id == tid)
                    return this._pss[i].getInfo();
            }
            return null;
        };
        MapView.prototype.getPanelCount = function () {
            var pc = 0;
            for (var i = 0; i < this._pss.length; i++) {
                pc += this._pss[i].getPanelCount();
            }
            return pc;
        };
        MapView.prototype.clearPanels = function () {
            while (this._pss.length > 0)
                this._pss[0].destroy();
        };
        MapView.prototype.onPanelShapeSelected = function (handler) {
            this._hps = handler;
        };
        MapView.prototype.onPanelShapeAdded = function (handler) {
            this._hpa = handler;
        };
        MapView.prototype.onPanelShapeDeleted = function (handler) {
            this._hpd = handler;
        };
        MapView.prototype.onPanelShapeChanged = function (handler) {
            this._hpc = handler;
        };
        MapView.prototype._findShape = function (id) {
            for (var i = 0; i < this._pss.length; i++)
                if (this._pss[i].getId() == id)
                    return this._pss[i];
        };
        MapView.prototype.setPanelShapePanelSlope = function (id, slope, infoOnly) {
            var s = this._findShape(id);
            if (s != null)
                s.setPanelSlope(slope, infoOnly);
        };
        MapView.prototype.setPanelShapePortrait = function (id, isPortrait) {
            var s = this._findShape(id);
            if (s != null)
                s.setPanelPortrait(isPortrait);
        };
        MapView.prototype.setPanelShapePanelType = function (id, panelType) {
            var s = this._findShape(id);
            if (s != null) {
                var f = this._rszFct * MapView._TSZ / MapView.getLengthOfTile(this._z);
                var pi = {
                    width: f * panelType.width,
                    height: f * panelType.height,
                    hgap: f * panelType.hgap,
                    vgap: f * panelType.vgap
                };
                s.setPanelInfo(pi);
            }
        };
        MapView.prototype.setPanelShapeArea = function (id, area) {
            var s = this._findShape(id);
            if (s != null)
                s.setPanelShapeArea(area);
        };
        MapView.prototype.setPanelShapeRotation = function (id, degree) {
            var s = this._findShape(id);
            if (s != null)
                s.setRotationDeg(Number(degree));
        };
        MapView.prototype.setPanelShapeShading = function (id, shading) {
            var s = this._findShape(id);
            if (s != null)
                s.setPanelShapeShading(shading);
        };
        MapView.prototype.setPanelShapeMountType = function (id, mountType) {
            var s = this._findShape(id);
            if (s != null)
                s.setPanelMountType(mountType);
        };
        MapView.prototype.setPanelShapeSelected = function (id) {
            this._pss.forEach(function (v) {
                v.setSelected((v.getId() == id));
            });
        };
        MapView.prototype.setPanelPortrait = function (isprt) {
            this._isprt = isprt;
            for (var i = 0; i < this._pss.length; i++)
                this._pss[i].setPanelPortrait(isprt);
        };
        MapView.prototype.showArrow = function (s) {
            this._pss.forEach(function (v) { v.showArrow(s); });
        };
        MapView.prototype.showControls = function (s) {
            this._pss.forEach(function (v) {
                if (v.isSelected() || !s) {
                    v.showControls(s);
                }
            });
        };
        MapView.prototype.exportMap = function () {
            this.showControls(false);
            this.showArrow(false);
            var d = this._mapLayer.toDataURL(null);
            this.showArrow(true);
            this.showControls(true);
            return d;
        };
        MapView.prototype.setState = function (data) {
            var ps = data.panelShapes;
            var m = this;
            if (m._z != data.zoom ||
                m._lat != data.lat ||
                m._lng != data.lng) {
                m._z = data.zoom;
                m._lat = data.lat;
                m._lng = data.lng;
                m._setMapTiles(m._bil(m._lat, m._lng, m._z));
            }
            this._mapLayer.setRotationDeg(data.mrot);
            this._olGroup.setPosition(data.olpos);
            this._rwh.setRotationDeg(data.mrot);
            ps.forEach(function (p) {
                var c = {
                    width: p.width,
                    height: p.height,
                    parent: m._olGroup,
                    panelInfo: p.panelInfo,
                    draggable: true,
                    spid: m._spid++,
                    name: 'panelShape',
                    ctlLayer: m._ctlLayer,
                    rotation: p.rotation,
                    emptyMap: p.emptyMap,
                    azimuth: p.azimuth,
                    pslope: p.pslope,
                    pslopeprt: p.pslopeprt
                };
                m._setCfgHdlr(c);
                var srect = new Rectangle(c);
                srect.setPosition({ x: p.x, y: p.y });
                m._pss.push(srect);
                if (m._hpa != null)
                    m._hpa(srect.getId());
                m._onclk(srect);
                if (m._cf.onPanelInfoChanged != null)
                    m._cf.onPanelInfoChanged();
            });
            this._mapLayer.draw();
        };
        MapView.prototype.getState = function () {
            var a = [];
            for (var i = 0; i < this._pss.length; i++)
                a.push(this._pss[i].getState());
            return {
                lat: this._lat,
                lng: this._lng,
                zoom: this._z,
                olpos: this._olGroup.getPosition(),
                mrot: this._mapLayer.getRotationDeg(),
                panelShapes: a
            };
        };
        MapView.prototype._ads = function (pos) {
            var m = this;
            var f = this._rszFct * MapView._TSZ / MapView.getLengthOfTile(this._z);
            var pi = {
                width: f * this._cpi.width,
                height: f * this._cpi.height,
                vgap: f * this._cpi.vgap,
                hgap: f * this._cpi.hgap
            };
            var c = {
                x: 0,
                y: 0,
                width: 2 * (pi.width + pi.hgap),
                height: 2 * (pi.height + pi.vgap),
                draggable: true,
                panelInfo: pi,
                spid: m._spid++,
                name: 'panelShape',
                ctlLayer: this._ctlLayer,
                parent: this._olGroup,
                azimuth: 180,
                pslope: 20,
                pslopeprt: this._isprt
            };
            this._setCfgHdlr(c);
            var srect = new Rectangle(c);
            if (pos != undefined)
                srect.setAbsolutePosition(pos);
            var rtn = this._mapLayer.getRotationDeg();
            srect.setRotationDeg(-rtn);
            this._pss.push(srect);
            this._mapLayer.draw();
            if (this._hpa != null)
                this._hpa(srect.getId());
            this._onclk(srect);
            if (this._cf.onPanelInfoChanged != null)
                this._cf.onPanelInfoChanged();
        };
        MapView.prototype._onclk = function (s) {
            if (s.isSelected())
                return;
            this._pss.forEach(function (v) {
                v.setSelected((s == v));
            });
            if (this._hps != null)
                this._hps(s.getId());
        };
        MapView.getLengthOfTile = function (zoom) {
            var latlng = new google.maps.LatLng(-32.050443, 115.763436);
            var numTiles = 1 << zoom;
            var projection = new MercatorProjection(MapView._TSZ);
            var worldCoordinate = projection.fromLatLngToPoint(latlng);
            var pixelCoordinate = new google.maps.Point(worldCoordinate.x * numTiles, worldCoordinate.y * numTiles);
            pixelCoordinate.x -= MapView._TSZ;
            worldCoordinate = new google.maps.Point(pixelCoordinate.x / numTiles, pixelCoordinate.y / numTiles);
            var nlatlng = projection.fromPointToLatLng(worldCoordinate);
            var tsz = google.maps.geometry.spherical.computeDistanceBetween(latlng, nlatlng);
            return tsz * (MapView._TSZ / 256);
        };
        MapView.prototype._setMapTiles = function (images) {
            this._mapGroup.destroyChildren();
            var m = this;
            for (var i in images) {
                var t = new HdSolar.MapTile(this._mapGroup, images[i]);
                this._tiles.push(t);
            }
        };
        MapView._TSZ = 512;
        MapView.oktaID = "";
        return MapView;
    })();
    HdSolar.MapView = MapView;
    ;
    var SolarPanel = (function () {
        function SolarPanel(config) {
            this.empty = false;
            this.visible = true;
            this.isprt = false;
            this.rawimg = null;
            this.kimg = null;
            this.kimgl = null;
            this.kimgp = null;
            this.dblclick_firstclick = false;
            this.bopq = false;
            this.config = config;
            this.pos = config.position;
            this.size = {
                width: config.width, height: config.height
            };
            this.isprt = config.isprt;
            this.empty = config.empty;
            this.loadImage();
        }
        SolarPanel.prototype.loadImage = function () {
            var imgloc = 'images/';
            var me = this;
            this.rawimg = new Image();
            this.rawimg.onload = function () { me.imageLoaded(); };
            this.rawimg.src = this.isprt ? SolarPanel.imgDatap : SolarPanel.imgDatal;
        };
        SolarPanel.prototype.isEmpty = function () { return this.empty; };
        SolarPanel.prototype.setVisible = function (show) {
            if (show == this.visible)
                return;
            this.visible = show;
            if (this.kimg != null) {
                show ? this.kimg.show() : this.kimg.hide();
            }
        };
        SolarPanel.prototype.setOpaque = function (bOpaque) {
            this.bopq = bOpaque;
            if (this.kimg != null)
                this.kimg.setOpacity(this.empty ? 0 : this.bopq ? 1 : 0.3);
        };
        SolarPanel.prototype.destroy = function () {
            this.kimg.destroy();
        };
        SolarPanel.prototype.setPortrait = function (isPortrait) {
            if (this.isprt == isPortrait)
                return;
            this.isprt = isPortrait;
            var w = this.config.width;
            var h = this.config.height;
            var m = Math.min(w, h);
            if (this.kimg != null)
                this.kimg.hide();
            this.kimg = this.isprt ? this.kimgp : this.kimgl;
            if (this.kimg == null) {
                this.loadImage();
            }
            else {
                if (this.visible)
                    this.kimg.show();
            }
        };
        SolarPanel.prototype.setBound = function (pos, size) {
            if (pos.x != this.pos.x) {
                this.pos.x = pos.x;
                if (this.kimg != null)
                    this.kimg.x(pos.x);
            }
            if (pos.y != this.pos.y) {
                this.pos.y = pos.y;
                if (this.kimg != null)
                    this.kimg.y(pos.y);
            }
            if (size.width != this.size.width) {
                this.size.width = size.width;
                if (this.kimg != null)
                    this.kimg.width(size.width);
            }
            if (size.height != this.size.height) {
                this.size.height = size.height;
                if (this.kimg != null)
                    this.kimg.height(size.height);
            }
        };
        SolarPanel.prototype.imageLoaded = function () {
            var me = this;
            var c = {
                x: this.pos.x,
                y: this.pos.y,
                image: this.rawimg,
                width: this.size.width,
                height: this.size.height,
                opacity: 0.3,
                name: 'panel',
                visible: this.visible
            };
            this.kimg = new Kinetic.Image(c);
            if (this.isprt) {
                this.kimgp = this.kimg;
            }
            else {
                this.kimgl = this.kimg;
            }
            var w = this.config.width;
            var h = this.config.height;
            var m = Math.min(w, h);
            this.kimg.on('mousedown', function () { me.onmousedown(); });
            this.kimg.on('mouseover', function () {
                if (me.empty || me.bopq)
                    return;
                this.stroke('red');
                this.strokeWidth(3);
                this.opacity(1);
                this.getLayer().draw();
            });
            this.kimg.on('mouseout', function () {
                if (me.empty || me.bopq)
                    return;
                this.stroke(null);
                this.strokeWidth(null);
                this.opacity(0.3);
                this.getLayer().draw();
            });
            this.config.parent.add(this.kimg);
            this.kimg.moveToBottom();
            this.kimg.setOpacity(this.empty ? 0 : this.bopq ? 1 : 0.3);
            if (SolarPanel.tmr != null)
                clearTimeout(SolarPanel.tmr);
            SolarPanel.tmr = setTimeout(function () {
                var l = me.config.parent.getLayer();
                l.draw();
            }, 50);
        };
        SolarPanel.prototype.onmousedown = function () {
            if (this.dblclick_firstclick) {
                this.empty = !this.empty;
                this.kimg.setOpacity(this.empty ? 0 : 1);
                if (this.config.onPanelCountChanged != null)
                    this.config.onPanelCountChanged();
            }
            this.dblclick_firstclick = true;
            var me = this;
            var vtimer = setTimeout(function () { me.dblclick_firstclick = false; }, 500);
        };
        SolarPanel.imgDatal = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAAkCAYAAAA3pUL9AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAABKXSURBVGhDTZp5jF/VdcfP7/32WezxMvZ4HY/HniRsxgsYBwgxYjFEbUobRXEa0wolUqqCqmJSIqDUxpCoGDsmUVFbEQWykMQUSmmav0sIi9qGEgeBg/Ey4wVj7PF4Zn7L+22v38+58wpvdH3fu+/cc889y/ec+37OvPj8c0krk7NCuWAZi8w6Zu1mbHGjaVE2a1FEiyyT6FWnY81mw3KFvJmeNcH/oYsbsRUKBd3xwnxOs9m2jCZmxSfx4UTPGUvEJ5fL6TFxamel8Xa7DVGg0btMwljHn1mEefBpawZ/yJOBzu/VR9qBWr3WEh08mpoUaS3JGIn2u3v3JidOTdu+f/hHK3YXrdNuWbNes/Xr1tr05KQdOnRIksPOrNFo2Lbbb7efP/OM5bJ532Q7kXa04NYvbbWnf/iUdXWVrK2FEXzd2vVWj2t28J13LJ/PW6vV8vE/+eJW++nPfmrFYtEiCdXR2OIli2zpkqX26quv+Th09UbN/vgLX7Bf/vI/zKQ4FNDR5ltS4G233WbP/8tzli8UpYxIYx1btmy59ff325v/+1ttMB+ME3fsjju+ZMMrBix748237vjdO0fs0LExKxQLsmZkWe2iXm/Y5NS0NbRIVhvLYmExrVVrNiElZCW8iP2d1GYXRFutVn1TkTwlinLWbLRtauqCdaSQfDZnWVkzl8tapd6U1VtWLnc5fVaCtVodV1LcbMpDis4/I3osOzVVsXyx5I3xUrFs7Vai9WpWKpcld8lyalpUGxevTtsVVuoSH8m4aNEiW7a4X+LiMjJxNmpbXvcSMzRtOsrJBfNq9PLwKEqsXJJCnB73lGtoHi5SLGW1adwQFzVvzMsXpLysXEy0zDNZIJ/IzWS1pFG1Tqsu92zIYnW1hiydaHXxV18QbUmaz8odIzmv7Gc5rdtJFEquY60NrSydl4HwtYL6nDabS9Q0P5djP4QTDkpMFXJaECZpg5E2q1jTnVyY5bVbWaytGBCJN+Lk/+9lAUuITS3foYl8JvZCLHIvEt1F2nzSaWq8qVHetUQr4bREorFEodRRn/LHTWUzxafWZh09Md5u8xL1tjQGHf90fA9EMsuKs99zabMZuVDbBfQNS8oARE2L67FPRESEptUVz20JwwY8hkRL3xB9Skef8mgK6NJNp/SVStXnc08cpz30jOO67ZmxOI4dK5qtprW0LjtivCFA7MiC0KIU5jmd1nPeLp94iCfjyJD5zp69Sf/gp+y7+56w7q6yNte2ljZ0/Q2bbboyZa+/9rr8vySNJhKyYn+3Y4ft3v1tMUJXYZEok7V7vrHdHtrxkHWVFTu6arW6bdmyxSrVSXvppf90pEYoNvTwrl127733ar1u1K2NtOzSSy6xy9estZ/85BkrKmZB8ymt98D9D9j3v/+k4nbKvU1LWkObfuSRh51HT3ePxqUAyXfZZWtsZGTE9j/7rMKNGM5YrdGxv/zqn9nxsYOW+d6+x5OX3zhoLzz/C+sWgWtD8TN/fr9r78IFgZECFu2jocvWrLEDb/5GwpCSFE9EkoS95OKL7HdvvS3FKJhwHWmjr69Pt20bHz8nIFJIJAItAd7KkVV2+L3DijPxlcZRMJtbLDQeGxv1e65YALd61Wo7fPiINgTXcLUEbiOrR+zdd3/vYCb3tLYAELBbsGDAThw/oVgV8mjJuJWxzVdfaTd8dh0yZ10zXV1drn0alsznw+SCcipjJSmCRq4rCwGh4Tmv9yAf7tWl1FUsKWcXsxrP+nghX5KWu/w+0ArgpKKsvCGfL1heSJPPsabWV5/VRnMSnFYAqaVoZMhJTjaATEG2cI9iUpQviJ/P1T3vocd9XW4pKUJ4LqyGhYhfYrIh30/jKO3Te5rT6Lk9Q487txRXgE5bqEq+Zhx+nlY8jtTrOdiINBGABrxgHHxAODzG49wlCz0GQaHcMyfFAOh8gItb/fncmffBSwJECelJK3JGaRBNUO1kZ1yCxOxa9XE0Ks3rPe5XEE1RDc1DzwJppRTmkmv1DkvNaBiNQ0Meywh6m8jvFgvj1GIkv9A0rnVIjRkZRCBrkWLeGxtAIeKTiEda5QGwUVvK0iAclISkJBklFiYzJaQXAYoSNMgXx3Uhbt0tTSNx00BhigYEr9Z4DnTM4R3CVqvMa3pf0RziPKBvxeeCwvSzent9bhNvknewDuiJu8GLFjfEX7L09HS7x+BVeBI94/PmzXMezKeEjWPlaO2vuyev8YrLAX+AkrDDqDmE3bZtm50Ye99mCdkYbDQrdt1117kQv/71Kx6zjCPoN795rz3+2KMzjuEO5hu6//77bOfOXYr9slsRV//01ZtkxJxKwFdUBOB7OWm5aXf+9d22d+/eEHNSeVu0w8PD9olPjFixnBOPbseGmpT6ta991eY8N1ula118cXmlNG3+rrvuckWXS9qILNoSn1XDK+2Tq4cdf0rFWdaWNWvNmt188xabOPeuZR7/zr7k9QPv2XPP/pt1yWUp7dhEb2+33zvkaxVnqFhcOTRkx4SkgAKL47YIsHz5MkfSnFBXRY6XfrNnz3UlUTJSSKCYtpB00fKVdvLkKUdRipqO4jUrV54/f769/77G5ZbBK1riu8JGR496qMgRgxziObRSchw75oBEGMrRXXn9/XPt1MkPRK9DifjX27F95qpNtuWmKwjVKMSYGhbkHmsUQE/GtSma17aiLZVUb3qchjihp5Wk4bwEzmmMDeeZo94RVcLwDKKqPnVrwIt5KR1zu1UrF8kGUnpJqA1S93R3e94tUeuqOcLrfU9Pj8sXGsitjOEZQnK43Fpb88m3Ob0HDYAqRzE3kXqs6Jce2SQXm/LyUULTO6ksElEbz5AjOEVDeIYR71S35qgbqWYCb9w25QcauxDc6w9Pwv2DVUHTEPO0gPaqoMQnfabKcpR32lDg0PMcLkrG8B4AjtpIMVOeBUKlBqmgrZ7yzBdzxqpZEUaBrxGdLEJqoSDQLAcU5sEYoeHXVBoCVEgHPiY+8ASAWgKVtlpD8edNtFRSvomZRp0dUmHgJ9ldLkQGmPxGzZVC5SceKCTdcFsHDi8pWw1XUvbGm27a0VXus9f+639kdqULaVtbseGVK70COnv2rLsBB2AW3nLLFnvv8Ki7n7uoXDAj17zllpvtrbcOOPLhxkDj6tWrhZpz7ZwqKIoJ4hINb/3TbXZ8dNTmz51jvbNnC0F7bHjVKlu3br2dPzduc4W0rE2hceutnxMQNa3UXbK+OXNtdt8c65vdZ1/e+mUbPTaqimmBI/Mc8RoZWW0bN15pE+cnbeHCAeubO9t6ZvXY5266UZ7XVCKSFgYGFtvg8uU2u6fXUTDWgRtgIDamdE5lY4mOVbVqwxYNLLXly4Zk4VhxJ0tKZVhrQf8yG1i4zGMPX5aybd6chZ5OPjh9Tov5UkJYpZ/apJ2f+NCqiincHmvldfyb7J9nZ8dPa5Oqa0VcrcU2ceEDO/3BmFV1JFSUy1KqpWXVU6dP2OkzJxWfJTeQnMDRm/Pt2PGjHucW5a0SV1RuHpYihy2jFJC8/ftT9qOfPWvdM4vgsgBDQXXuuXPnFFP4PieKUKseOSo0lpTUMxREhMhKwf6RQ+9K0LxvCvfvEaIDGB+e+dABIxzoG7Zi9TI7onq3pM26b+JjuhYvXmyjx8ccK6imqIHxMK+N88ALR72sQoNUtdKOHhNKZ0Khg9KJ/YGBATt16n2/T3QkJTyuWnu5ff4PrmPvYiC3AzGZFCqdAOO5KDBiIlAeSYic3NHVKCF5l9PhnLSS1+kZN3UQknJITf61AZqS3J2CXVbI6vBfFq8iXz9kbTaWUZ0M+OULCoGsWkQTrdbPZIoaEwJrLK970hryIJ/quIC0gA9N49TXlEsJMug50hx6VxTBzEa5uEdYgpvej1Qfu8iLacpISzRHVDGGPlUWPQ1+XORGQCQR6FAfY7WPAxEgAi2g43U2oOIAhbWQA88KYMOFqrWQ8wS8/JrxJsD0oyugNONcfninEvEiP21CR/yfcdAtPQDQT1emfZzjX+yoGsoySkJKTWiovCjhvCQUL/gx3w8OEphKjOd0s47yMzRpS9MLtPBJaVM+dcmXjrEG63KYqPteONQEfrxHHoIus/fRR5ORNdfaI9/abd3dZdcGEzesW6eEXLSXX345gI6igoXvvPNO+8HTT/mG/Xgoq0G/fft2e2z3bh3zulCixlq24Yq1qoP77KVf/UrILcDQxcIPPnCP7dLhm4RPyY51BlcM2vr1V9iPf/TDmVoW2ti+/vW/sP3799v58+PuTcjH2jt37rS/3UF5qvUAOW1qcHDQrr36Wnv6x8/oqNnlXlevTtsdf367cINycc9jydiHsT3+vX+ysuIxUbGAtRYJurvKRYHAMfGSOyivIug111xjr7z+mldD5E8lM3eVTZs2qQZ+VbFEHY3bCOUXLVBV0+1lHeO4IQX6+nUX2RtvvKExvh0LjKQwkH/FiiE7ePBtj2UulLhmzeV24MBvZ8ICB5bFZcH1G9bbf//mTa/02CyeAM2Qssiho5StRVdYU5nl6k0b7Y/+8DOKWl2caijT+JTq+VP3nEHr9TiUbYWMj1GqTUxM+L2XaUJTxmjj4+PeIzSwz3uExQqMswHGsBpj3UJ7rJL20CiSlXOL1tUjEOvK+2cbFMkcUli5HD4YlEVPzk/n8R4+9HgbfdoYd1xRuArchLxCSC//BASATgAePpWSG6mswskmvRCACwbcYWHQML0csJwH70kKfKcSP56JuybxKA+SwOGgLwzw+KJCU8+Hg6beKQWiML4vpfGHHE2BVUNVEc+M0/A6mld+zGnG8gD1jgecmEBmxQFlFhsIXx0CmvHMnijz6N2BtJBvVC29T0tDfhkAZRnHLUHggJ7QgZJskHoZhVKpCc2loKwUQ8vJW8jFhAdKLpDGNDfPuDwlRXhvpDV5VXpI4dlTpfrIeSg1iS68o3Ahu5B6JBzI1ZEWQwpQ3alNd1RXcq71VADaSXthI1RY0trHtErTfkTTkBX13BZ6+nfhsPGWaBOrSWN18a04D+ZgNRro2hBPGdyqTVGq3qcPmUG1tA7gIH5qPVAfRQGYIG/6LlZDySByQ4f5RpMPAFWtF2TP/P23vp1cvul6e/DBndbbMyukBwl3xYZ1tnBBv/37iy+6xtHCtNLL/ffdZ0888YTVlA7Iu1ws9NCuXfY337jHER2YRzlXbdyomnWuvfDCv1qJD/FSJIeAPXv22d133y3k5uNbOOgvHVplN1x/gz355D8r1gKix9Upu+uvttsLL/7Czp45JavyzV9loTbz8COPSJYHFL98LODrZ9uWLFlqmzdvth889bTHa0YeVJVivvLF26xRG7fMnkd3J6Mnz9uTIkBQT/qayIKUemfPnHHXa6s2xs2HdHgfO3rMXc1RGk+Q9YH9sWOUeqHYwKocEnp7Z/mnVL4ndRLq2tiGVOodP3FciKlErzEKgTiJbPmSZXZ8bFQgV3RLYLFlg0PKCKArGMHxUl4hqw8OrvCPBbg163ExZ+mSJTZ28oQDZSYqqlxM7NKRYdv2lc979eW+DaCwASbzoY1W5OCrMd5zOA6Iqj6tnrxRMeWcNsRjWJh75oGefpFmVIZmhe4gJJWYJ3rNF7Gvw6dW1g+pi9+KdAD3WA4f72geh3K0nl6QF1Dl+53KVZ28ClIuqQiatMGPjROumi9qLYZw4Co9jZf+E4JbL+RN34yYMsbFM8zQqLu0Nw7yCBXKRWKeNZgTaUN+QBdfBzHdQ8PKbDqMfcSbK30f/uFZc/SH688MqGlM3ohHEoLIzgR/pT8f01/kPxTppcj82w7fcmAPjnKwb2vRDsLK3RCIlNDBGto049xntLFYi4tENEJ3zWtpoSiv2FMRH+X5DNMl7Zek/V4tzu8/4SuH9mcdIXNH7p0AlMrvLqT+aUiuZkegw6+DYh6Up5eSD2DjOxebZ4x7lNXQflpiHGscxUYt5Ak6iVT92iyBSO1C1X/qmJicsPGpCUF4pMNyn01OXbCpySmrTNVscnzSVizVWbbWtukLNatprDJZs+p03S656DKrVuo688ZWqzR0X/MKbNHChXbh/Hkh6oRNTY/rfHzWrtywySqii+tC/LijpmKiPMtGPnmxVVRm1rXhmA/rGr/0U2usJGXxo3KroQ3IoI2ajm1Xftpamo+BQfG6jNDVPcsuHl5lraryqviAxnGjKuAacENl9v98f1LV5EanriNUyHEAESgXNBlyI1c49Sj/4XLSGvc4lbs31pdmoeHLBZrk+sjVwwCFC0hOpcb/XQicsYw8RgbkpxB4c+m1jxPPYuzy0ESuRnkYYjk96fgZWLvPCh/4iiICOSC1d1XKr9r/AXaEnpfjWblVAAAAAElFTkSuQmCC";
        SolarPanel.imgDatap = "data:image/png;base64,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";
        SolarPanel.tmr = null;
        return SolarPanel;
    })();
    var BaseShape = (function () {
        function BaseShape(c) {
            this.azimuth_offset = 180;
            this.azimuth = 0;
            this.pslope = 20;
            this.pslopeInfoOnly = false;
            this.pslopeprt = false;
            this.panelCount = 4;
            this.area = 0;
            this.shading = { yearlyshade: "97", janshade: "97", febshade: "97", marshade: "97", aprshade: "97", mayshade: "97", junshade: "97", julshade: "97", augshade: "97", sepshade: "97", octshade: "97", novshade: "97", decshade: "97" };
            this.mountType = 'slope';
            this.bselected = false;
            var me = this;
            this.config = c;
            this._spid = c.spid;
            this.pslope = this.config.pslope;
            this.pslopeprt = this.config.pslopeprt;
            this.azimuth = this.config.azimuth;
            this.kgroup = new Kinetic.Group({
                x: 0, y: 0,
                width: c.width,
                height: c.height,
                name: c.name,
                draggable: true
            });
            c.parent.add(this.kgroup);
            this.kgroup.on("click", function () {
                if (me.config.onclicked != null)
                    me.config.onclicked(me);
            });
        }
        BaseShape.prototype.getId = function () {
            return this._spid;
        };
        BaseShape.prototype.getNode = function () {
            return this.kgroup;
        };
        BaseShape.prototype.getGroup = function () {
            return this.kgroup;
        };
        BaseShape.prototype.getInfo = function () {
            return {
                id: this.getId(),
                panelCount: this.getPanelCount(),
                azimuth: this.getAzimuth(),
                rotation: this.getRotation(),
                area: this.area,
                shading: this.shading,
                slope: this.pslope,
                orientation: this.pslopeprt ? 'portrait' : 'landscape',
                mountType: this.mountType
            };
        };
        BaseShape.prototype.showControls = function (bshow) {
        };
        BaseShape.prototype.showArrow = function (bshow) {
            bshow ? this.arrow.show() : this.arrow.hide();
        };
        BaseShape.prototype.update = function (anchor) {
        };
        BaseShape.prototype.update2 = function () {
        };
        BaseShape.prototype.changeZoom = function (isZoomIn) {
        };
        BaseShape.prototype.setPosition = function (pos) {
            this.kgroup.setPosition(pos);
        };
        BaseShape.prototype.setAbsolutePosition = function (pos) {
            this.kgroup.setAbsolutePosition(pos);
        };
        BaseShape.prototype.getAbsolutePosition = function () {
            return this.kgroup.getAbsolutePosition();
        };
        BaseShape.prototype.getLayer = function () {
            return this.kgroup.getLayer();
        };
        BaseShape.prototype.getRotation = function () {
            var az = this.kgroup.getRotationDeg();
            if (az < 0)
                az = 360 + az;
            if (az >= 360)
                az = az - 360;
            return az;
        };
        BaseShape.prototype.setRotationDeg = function (rotation) {
            this.kgroup.setRotationDeg(rotation);
            this.getLayer().draw();
        };
        BaseShape.prototype.getPanelCount = function () {
            return this.panelCount;
        };
        BaseShape.prototype.getAzimuth = function (azr) {
            return 0;
        };
        BaseShape.prototype.getEmptyMap = function () {
            return null;
        };
        BaseShape.prototype.getState = function () {
            var p = this.kgroup.getPosition();
            var s = {
                x: p.x, y: p.y,
                pslope: this.pslope,
                pslopeprt: this.pslopeprt,
                panelInfo: this.config.panelInfo,
                width: this.kgroup.width(),
                height: this.kgroup.height(),
                rotation: this.kgroup.getRotationDeg(),
                azimuth: this.getAzimuth(),
                emptyMap: this.getEmptyMap()
            };
            return s;
        };
        BaseShape.prototype.setPanelSlope = function (deg, infoOnly) {
            if (infoOnly === void 0) { infoOnly = false; }
            if (deg >= 0 && deg < 90) {
                this.pslope = deg;
                this.pslopeInfoOnly = infoOnly;
                this.update();
            }
        };
        BaseShape.prototype.setPanelPortrait = function (isprt) {
            this.pslopeprt = isprt;
        };
        BaseShape.prototype.setPanelInfo = function (pi) {
            this.config.panelInfo = pi;
            this.update();
        };
        BaseShape.prototype.setPanelShapeArea = function (area) {
            this.area = area;
        };
        BaseShape.prototype.setPanelShapeShading = function (shading) {
            this.shading = shading;
        };
        BaseShape.prototype.setPanelMountType = function (mountType) {
            this.mountType = mountType;
            if (mountType == 'flat')
                this.setPanelSlope(0, false);
        };
        BaseShape.prototype.destroy = function () {
            var l = this.getLayer();
            if (this.config.ondestroy != null)
                this.config.ondestroy(this);
            this.kgroup.destroyChildren();
            this.kgroup.destroy();
            l.draw();
        };
        BaseShape.prototype.setSelected = function (s) {
            this.bselected = s;
        };
        BaseShape.prototype.isSelected = function () {
            return this.bselected;
        };
        return BaseShape;
    })();
    ;
    var Rectangle = (function (_super) {
        __extends(Rectangle, _super);
        function Rectangle(c) {
            _super.call(this, c);
            this.row = 0;
            this.col = 0;
            this.bopq = false;
            this.solarPanels = new Array();
            this.init(c);
        }
        Rectangle.prototype.init = function (config) {
            var me = this;
            if (this.config.panelInfo == undefined) {
                this.config.panelInfo = { width: 26.07947, height: 15.80574, vgap: 0.4014658, hgap: 0.4014658 };
            }
            this.boundRect = new Kinetic.Rect({
                x: 0, y: 0,
                stroke: 'green',
                width: this.config.width,
                height: this.config.height,
            });
            this.groupPanels = new Kinetic.Group({ x: 0, y: 0,
                width: this.config.width, height: this.config.height
            });
            if (config.rotation != null)
                this.setRotationDeg(config.rotation);
            this.kgroup.on('dragstart', function () { document.body.style.cursor = 'move'; me.config.onclicked(me); });
            this.kgroup.on('dragend', function () { document.body.style.cursor = 'default'; });
            this.kgroup.add(this.boundRect);
            this.kgroup.add(this.groupPanels);
            this.topLeft = new HdSolar.Anchor({ parent: this, position: { x: 0, y: 0 }, name: 'topLeft', dummy: true });
            this.topRight = new HdSolar.Anchor({ parent: this, position: { x: this.config.width, y: 0 }, name: 'topRight', dummy: true });
            this.bottomLeft = new HdSolar.Anchor({ parent: this, position: { x: 0, y: this.config.height }, name: 'bottomLeft', dummy: true });
            this.bottomRight = new HdSolar.Anchor({
                parent: this, position: { x: this.config.width, y: this.config.height }, name: 'bottomRight',
                positionCallbackFunc: function () {
                    return {
                        x: me.topLeft.x() + me.boundRect.width(),
                        y: me.topLeft.y() + me.boundRect.height(),
                    };
                }
            });
            var rcfg = {
                parent: this,
                position: { x: this.config.width, y: 0 },
                name: 'rotator', dummy: false, fill: 'yellow'
            };
            rcfg.dragBoundFunc = function (pos) {
                var layer = me.getLayer();
                var groupPos = { x: 0, y: 0 };
                var gapos = me.getAbsolutePosition();
                var rpos = { x: pos.x - gapos.x, y: pos.y - gapos.y };
                var lrot = layer.getRotationDeg();
                var rotation = Utils.degrees(Utils.angle(groupPos.x, groupPos.y, rpos.x, rpos.y));
                rotation -= lrot;
                me.setRotationDeg(rotation);
                me.groupPanels.moveToTop();
                me.onRotate(me.getAzimuth());
                layer.draw();
                return pos;
            };
            rcfg.positionCallbackFunc = function () {
                return me.topRight.getPosition();
            };
            this.rotator = new HdSolar.RotatorAnchor(rcfg);
            this.addCloseButton();
            this.addOrientationControl();
            this.addDownsideArrow();
            this.update();
        };
        Rectangle.prototype.update2 = function () {
            this.bottomLeft.y(this.bottomRight.y());
            this.topRight.x(this.bottomRight.x());
        };
        Rectangle.prototype.changeZoom = function (isZoomIn) {
            var f = isZoomIn ? 2.0 : 0.5;
            this.kgroup.x(this.kgroup.x() * f);
            this.kgroup.y(this.kgroup.y() * f);
            var br = this.bottomRight;
            br.x(br.x() * f);
            br.y(br.y() * f);
            this.config.panelInfo.width = this.config.panelInfo.width * f;
            this.config.panelInfo.height = this.config.panelInfo.height * f;
            this.config.panelInfo.hgap = this.config.panelInfo.hgap * f;
            this.config.panelInfo.vgap = this.config.panelInfo.vgap * f;
            this.row = this.col = 0;
            this.update();
        };
        Rectangle.prototype.update = function () {
            var a = this.bottomRight;
            var aX = a.x();
            var aY = a.y();
            var p = this.pslopeInfoOnly ? this.config.panelInfo : this.translatePanelInfo(this.config.panelInfo);
            if (this.pslopeprt) {
                var t = p.height;
                p.height = p.width;
                p.width = t;
            }
            var minX = this.topLeft.x() + p.width + p.hgap;
            var minY = this.topLeft.y() + p.height + p.vgap;
            if (aX < minX)
                aX = minX;
            if (aY < minY)
                aY = minY;
            this.bottomLeft.y(aY);
            this.topRight.x(aX);
            this.groupPanels.setPosition(this.topLeft.getPosition());
            this.boundRect.setPosition(this.topLeft.getPosition());
            var width = this.topRight.x() - this.topLeft.x();
            var height = this.bottomLeft.y() - this.topLeft.y();
            if (width && height) {
                this.rotator.setPosition(this.topRight.getPosition());
                this.kgroup.setSize({ width: width, height: height });
                this.boundRect.setSize({ width: width, height: height });
                this.arrow.setPosition({ x: width / 2, y: height + 8 });
                this.drawPanels();
                this.orAnchor.x(width + 20);
                this.groupClose.x(-20);
            }
        };
        Rectangle.prototype.addCloseButton = function () {
            var m = this;
            var szw = 14;
            this.groupClose = new Kinetic.Group({ x: -20, y: -szw / 2, width: szw, height: szw, draggable: false });
            var l1 = new Kinetic.Line({ stroke: 'black', strokeWidth: 1.5, listening: false, points: [4, 4, 10, 10] });
            var l2 = new Kinetic.Line({ stroke: 'black', strokeWidth: 1.5, listening: false, points: [4, 10, 10, 4] });
            var cr = szw / 2;
            var boundShape = new Kinetic.Circle({
                x: cr,
                y: cr,
                radius: cr,
                fill: 'lightcoral'
            });
            this.groupClose.add(boundShape);
            this.groupClose.add(l1);
            this.groupClose.add(l2);
            this.groupClose.on('mouseover', function () {
                var layer = this.getLayer();
                l1.setStroke('white');
                l2.setStroke('white');
                boundShape.setFill('red');
                layer.draw();
            });
            this.groupClose.on('mouseout', function () {
                var layer = this.getLayer();
                boundShape.setFill('lightcoral');
                l1.setStroke('black');
                l2.setStroke('black');
                layer.draw();
            });
            this.groupClose.on('mousedown touchstart', function () {
                var layer = this.getLayer();
                boundShape.setFill('Chocolate');
                l1.setStroke('white');
                l2.setStroke('white');
                layer.draw();
            });
            this.groupClose.on('mouseup touchend', function () {
                var layer = m.getLayer();
                boundShape.setFill('red');
                l1.setStroke('white');
                l2.setStroke('white');
                m.close();
            });
            this.kgroup.add(this.groupClose);
        };
        Rectangle.prototype.close = function () {
            var onchange = (this.config.onchange != null) ? function (o) { } :
                this.config.onchange;
            this.onRotate(0);
            this.destroy();
            onchange(this);
        };
        Rectangle.prototype.setPanelPortrait = function (isprt) {
            if (this.pslopeprt != isprt) {
                this.pslopeprt = isprt;
                for (var r = 0; r < this.solarPanels.length; r++) {
                    for (var c = 0; c < this.solarPanels[r].length; c++) {
                        this.solarPanels[r][c].setPortrait(isprt);
                    }
                }
                this.update();
            }
        };
        Rectangle.prototype.addOrientationControl = function () {
            var me = this;
            this.orAnchor = new Kinetic.Circle({
                x: me.kgroup.width() + 20, y: 20,
                radius: 6,
                fill: 'yellow', draggable: false,
                stroke: 'black', strokeWidth: 1,
            });
            this.orAnchor.on('mouseover', function () {
                var layer = this.getLayer();
                document.body.style.cursor = 'pointer';
                this.fill(me.pslopeprt ? '#F4A460' : 'yellow');
                layer.draw();
            });
            this.orAnchor.on('mouseout', function () {
                var layer = this.getLayer();
                document.body.style.cursor = 'default';
                this.fill(me.pslopeprt ? 'yellow' : '#F4A460');
                layer.draw();
            });
            this.orAnchor.on('mousedown', function () {
                me.setPanelPortrait(!me.pslopeprt);
            });
            this.kgroup.add(this.orAnchor);
        };
        Rectangle.prototype.addDownsideArrow = function () {
            var h = this.boundRect.height();
            this.arrow = new Kinetic.Shape({
                x: h / 2, y: h + 8,
                drawFunc: function (c) {
                    c.setAttr('strokeStyle', 'red');
                    c.setAttr('fillStyle', 'red');
                    c.beginPath();
                    var s = 4;
                    var p = [s, 0, s, s, 3 * s, s, 0, 4 * s];
                    [1, -1].forEach(function (v) {
                        c.moveTo(0, 0);
                        for (var x = 0; x < p.length; x += 2)
                            c.lineTo(v * p[x], p[x + 1]);
                    });
                    c.stroke();
                    c.closePath();
                    c.fillText('AZ', -7, 7 * s);
                }
            });
            this.kgroup.add(this.arrow);
        };
        Rectangle.prototype.onRotate = function (deg) {
            if (typeof (this.config.onrotate) != 'undefined') {
                this.config.onrotate(this, deg);
            }
        };
        Rectangle.resetRotation = function (ctl) {
            var p = ctl.getParent();
            var rr = 0;
            while (p != undefined) {
                rr += p.getRotationDeg();
                p = p.getParent();
            }
            ctl.setRotationDeg(-rr);
            var l = ctl.getLayer();
            if (l != undefined)
                l.draw();
        };
        Rectangle.prototype.translatePanelInfo = function (p) {
            var fa = Math.cos(Utils.radians(this.pslope));
            var f = this.pslopeprt ? fa : 1;
            var g = this.pslopeprt ? 1 : fa;
            return {
                width: p.width * f,
                height: p.height * g,
                vgap: p.vgap * g,
                hgap: p.hgap * f
            };
        };
        Rectangle.prototype.drawPanels = function () {
            var p = this.pslopeInfoOnly ? this.config.panelInfo : this.translatePanelInfo(this.config.panelInfo);
            if (this.pslopeprt) {
                var t = p.height;
                p.height = p.width;
                p.width = t;
            }
            var g = this.kgroup.getSize();
            var pw = (p.width + p.hgap);
            var ph = (p.height + p.vgap);
            var cl = Math.floor(g.width / pw);
            var ro = Math.floor(g.height / ph);
            if (cl == this.col && ro == this.row)
                return;
            this.col = cl;
            this.row = ro;
            var me = this;
            var rl = this.solarPanels.length;
            var maxr = (this.row > rl) ? this.row : rl;
            var hoff = p.hgap / 2, voff = p.vgap / 2;
            for (var r = 0; r < maxr; r++) {
                if (this.solarPanels[r] == null)
                    this.solarPanels[r] = new Array(this.col);
                var rc = this.solarPanels[r].length;
                var maxc = (this.col > rc) ? this.col : rc;
                for (var c = 0; c < maxc; c++) {
                    var s = { x: hoff + pw * c, y: voff + ph * r };
                    if (this.solarPanels[r][c] == null)
                        this.solarPanels[r][c] = new SolarPanel({
                            parent: this.groupPanels,
                            position: s,
                            width: p.width,
                            height: p.height,
                            isprt: this.pslopeprt,
                            empty: this._getEmptyCfg(r, c),
                            onPanelCountChanged: function () { me.onPanelCountChanged(); }
                        });
                    var v = r < this.row && c < this.col;
                    this.solarPanels[r][c].setVisible(v);
                    this.solarPanels[r][c].setOpaque(this.bopq);
                    var sz = {
                        width: pw,
                        height: ph
                    };
                    this.solarPanels[r][c].setBound(s, sz);
                    this.solarPanels[r][c].setPortrait(this.pslopeprt);
                }
            }
            this.onPanelCountChanged();
            this.getLayer().draw();
        };
        Rectangle.prototype._getEmptyCfg = function (r, c) {
            if (this.config.emptyMap == undefined ||
                this.config.emptyMap[r] == undefined ||
                this.config.emptyMap[r][c] == undefined)
                return false;
            return this.config.emptyMap[r][c];
        };
        Rectangle.prototype.setAzimuth = function (azimuth) {
        };
        Rectangle.prototype.getAzimuth = function (azr) {
            var az = Number(this.kgroup.getRotationDeg()) + this.azimuth_offset;
            az += (azr == undefined) ?
                0
                : azr;
            if (az < 0)
                az = 360 + az;
            if (az >= 360)
                az = az - 360;
            return az;
        };
        Rectangle.prototype.setRotationDeg = function (rotation) {
            this.kgroup.setRotationDeg(rotation);
        };
        Rectangle.prototype.onPanelCountChanged = function () {
            this.panelCount = this.row * this.col - this.getEmptyCount();
            if (this.config.onchange != null)
                this.config.onchange(this);
            if (this.panelCount <= 0) {
                var m = this;
                setTimeout(function () {
                    m.close();
                }, 500);
            }
        };
        Rectangle.prototype.getEmptyCount = function () {
            var n = 0;
            for (var r = 0; r < this.row; r++)
                for (var c = 0; c < this.col; c++)
                    if (this.solarPanels[r][c].isEmpty())
                        n++;
            return n;
        };
        Rectangle.prototype.getEmptyMap = function () {
            var e = new Array(this.row);
            for (var r = 0; r < this.row; r++) {
                e[r] = new Array(this.col);
                for (var c = 0; c < this.col; c++)
                    e[r][c] = this.solarPanels[r][c].isEmpty();
            }
            return e;
        };
        Rectangle.prototype.showControls = function (s) {
            var cs = [this.orAnchor, this.groupClose, this.rotator, this.bottomRight, this.boundRect];
            cs.forEach(function (c) { s ? c.show() : c.hide(); });
            this.bopq = !s;
            this.row = this.col = 0;
            this.update();
        };
        Rectangle.prototype.setSelected = function (s) {
            if (this.bselected != s) {
                _super.prototype.setSelected.call(this, s);
                this.showControls(s);
                this.boundRect.setStroke(s ? 'red' : 'none');
                this.boundRect.setStrokeWidth(s ? 3 : 0);
                this.getLayer().draw();
            }
        };
        return Rectangle;
    })(BaseShape);
    ;
})(HdSolar || (HdSolar = {}));;
(function (HdSolar) {
    var RotatorAnchor = (function (_super) {
        __extends(RotatorAnchor, _super);
        function RotatorAnchor(config) {
            _super.call(this, config);
            this.init();
        }
        RotatorAnchor.prototype.init = function () {
            var me = this;
            this.anchor.on('mousedown touchstart', function () {
                me.parent.getGroup().setDraggable(false);
                this.moveToTop();
            });
        };
        RotatorAnchor.prototype.drawGraphics = function (group) {
            var cfg = {
                fill: 'yellow',
                strokeWidth: 1,
                radius: 5,
                opacity: 0
            };
            this.circle = new Kinetic.Circle(cfg);
            group.add(this.circle);
            this.path = new Kinetic.Path({
                x: -8, y: -8,
                data: 'M12.582,9.551C3.251,16.237,0.921,29.021,7.08,38.564l-2.36,1.689l4.893,2.262l4.893,2.262l-0.568-5.36l-0.567-5.359l-2.365,1.694c-4.657-7.375-2.83-17.185,4.352-22.33c7.451-5.338,17.817-3.625,23.156,3.824c5.337,7.449,3.625,17.813-3.821,23.152l2.857,3.988c9.617-6.893,11.827-20.277,4.935-29.896C35.591,4.87,22.204,2.658,12.582,9.551z',
                scale: { x: 0.3, y: 0.3 }, fill: 'blue'
            });
            group.add(this.path);
        };
        RotatorAnchor.prototype.onHover = function (isHoverIn) {
            this.path.setFill(isHoverIn ? 'red' : 'blue');
        };
        return RotatorAnchor;
    })(HdSolar.BaseAnchor);
    HdSolar.RotatorAnchor = RotatorAnchor;
})(HdSolar || (HdSolar = {}));
