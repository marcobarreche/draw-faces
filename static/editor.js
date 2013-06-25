function Editor () {
    this.listImages = $('#all-images img');
    this.canvas = $('#canvas1');

    this.index = -1;
    this.allFacesPosition = {};
    this.facesPosition = [];
    this.currentFace = {};
    this.paint = true;
    this.loadingImage = this.createLoadingImage();
    this.showNextImage();
    this.activateEvents();
}
Editor.prototype.createLoadingImage = function() {
    var loadingImage = $('#loading-image');
    loadingImage[0].width = 500;
    loadingImage[0].height = 400;
    return loadingImage;
};
Editor.prototype.paintImageInCanvas = function() {
    $('#number-img').val(this.index);
    if (this.index >= this.listImages.length) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        alert('There are only ' + this.listImages.length + ' images!!.');
        this.index = this.listImages.length - 2;
        this.showNextImage();
        return false;
    } else if (this.index < 0) {
        this.index = 0;
    }

    img = $(this.listImages[this.index])[0];
    if (img.width == 0) {
        img = this.loadingImage[0];
    }
    this.canvas.attr('width', img.width);
    this.canvas.attr('height', img.height);
    this.canvas.css('width', img.width);
    this.canvas.css('height', img.height);
    this.ctx = this.canvas[0].getContext('2d');
    this.ctx.drawImage(img, 0, 0, img.width, img.height);
    if (this.allFacesPosition[img.src]) {
        this.facesPosition = this.allFacesPosition[img.src];
    }
};
Editor.prototype.showNextImage = function() {
    this.index ++;
    this.currentFace = {};
    this.facesPosition = [];
    this.refreshCanvas();
};

Editor.prototype.refreshCanvas = function() {
    this.paintImageInCanvas();
    this.paintFacesFromList();
};

Editor.prototype.paintAFace = function(left, top, width, height) {
    this.ctx.beginPath();
    this.ctx.rect(left, top, width, height);
    this.ctx.fillStyle = 'yellow';
    this.ctx.fill();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = 'black';
    this.ctx.stroke();
};
Editor.prototype.paintFacesFromList = function() {
    var i;
    for (i = 0; i < this.facesPosition.length; i++) {
        this.ctx.beginPath();
        this.ctx.rect(this.facesPosition[i].left,
                      this.facesPosition[i].top,
                      this.facesPosition[i].width,
                      this.facesPosition[i].height);
        this.ctx.fillStyle = 'yellow';
        this.ctx.fill();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = 'black';
        this.ctx.stroke();
    }
};

Editor.prototype.activateEvents = function() {
    var self = this;
    this.canvas.mousedown(function(e) {
        self.paint = true;
        self.currentFace = utils.getPosition(e, self.canvas.offset());
    });

    this.canvas.mouseup(function(e) {
        self.paint = false;
        var f = utils.getFace(e, self.canvas.offset(), self.currentFace);
        self.facesPosition.push(f);
    });

    this.canvas.mousemove(function(e) {
        if (!self.paint) {
            return null;
        }
        var f = utils.getFace(e, self.canvas.offset(), self.currentFace);
        self.refreshCanvas();
        self.paintAFace(f.left, f.top, f.width, f.height);
    });

    $('#btn-save').click(function(e) {
        if (self.index >= self.listImages.length) {
            alert('There is no another image!!!!');
            return false;
        }
        self.allFacesPosition[self.listImages[self.index].src] = self.facesPosition;
        $.post('/save_faces_position', {
            'src': self.listImages[self.index].src,
            'position': JSON.stringify(self.facesPosition)
        });
        self.showNextImage();
        return false;
    });

    $('#btn-reset').click(function() {
        self.currentFace = {};
        self.facesPosition = [];
        paint = false;
        self.refreshCanvas();
    });
    $('#btn-remove-last-face').click(function (){
        self.currentFace = {};
        self.facesPosition = self.facesPosition.slice(0, self.facesPosition.length - 1);
        paint = false;
        self.refreshCanvas();
    });
    $('#number-img').keyup(function(e) {
        if (e.which >= 48 && e.which <= 57) {
            self.index = parseInt($(this).val(), 10) - 1;
            self.showNextImage();
        }
    });
    $('#prev-img').click(function(e) {
        self.index = self.index - 2;
        self.showNextImage();
    });
    $('#next-img').click(function(e) {
        self.showNextImage();
    });
};

var utils = {
    getPosition: function (e, positionCanvas) {
        var x = e.pageX - positionCanvas.left;
        var y = e.pageY - positionCanvas.top;
        return {left: x, top: y};
    },
    getFace: function (e, positionCanvas, currentFace) {
        var pos = utils.getPosition(e, positionCanvas);
        var width, height, left, top;
        left = currentFace.left;
        top = currentFace.top;
        width = pos.left - currentFace.left;
        height = pos.top - currentFace.top;
        if (width < 0) {
            width = Math.abs(width);
            left = currentFace.left - width;
        }
        if (height < 0) {
            height = Math.abs(height);
            top = currentFace.top - height;
        }
        return {left: left, top: top, width: width, height: height};
    }
};

var editor;
$('#all-images img').attr('crossOrigin', 'Anonymous');
$('body').ready(function () {
    editor = new Editor();
});
