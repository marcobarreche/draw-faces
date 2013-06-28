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
        this.index = this.listImages.length - 1;
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
};
Editor.prototype.showNextImage = function() {
    this.index ++;
    if (this.index < 0) {
        this.index = 0;
    } else if (this.index >= this.listImages.length) {
        this.index = this.listImages.length - 1;
    }

    this.currentFace = {};
    this.facesPosition = [];

    var img = $(this.listImages[this.index])[0];
    if (this.allFacesPosition[img.src])
        this.facesPosition = this.allFacesPosition[img.src];
    this.refreshCanvas();
};
Editor.prototype.refreshCanvas = function() {
    this.paintImageInCanvas();
    this.paintFacesFromList();
};
Editor.prototype.paintAFace = function(left, top, width, height) {
    this.ctx.beginPath();
    this.ctx.rect(left, top, width, height);
    this.ctx.fillStyle = INSIDE_COLOR;
    this.ctx.fill();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = BORDER_COLOR;
    this.ctx.stroke();
};
Editor.prototype.selectAFace = function(left, top, width, height) {
    this.ctx.beginPath();
    this.ctx.rect(left, top, width, height);
    this.ctx.fillStyle = INSIDE_COLOR;
    this.ctx.fill();
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = SELECTED_FACE_BORDER_COLOR;
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
        this.ctx.fillStyle = INSIDE_COLOR;
        this.ctx.fill();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = BORDER_COLOR;
        this.ctx.stroke();
    }
};
Editor.prototype.activateEvents = function() {
    var self = this;
    $.get('/get_faces_position').done(function(data) {
        self.allFacesPosition = JSON.parse(data);
    }).fail(function() {
        self.allFacesPosition = {};
    });

    this.canvas.mousedown(function(e) {
        self.paint = true;
        self.isMoving = false;
        self.isResizing = false;

        self.currentFace = utils.getPosition(e, self.canvas.offset());
        var p = utils.getFaceAndAssociatedAction(self.currentFace, self.facesPosition);
        if (p) {
            var position = p[1];
            var newFacesPosition = p[2];
            if (p[0] == 'move') {
                self.isMoving = {offsetX: self.currentFace.left - position.left,
                                 offsetY: self.currentFace.top - position.top};
            } else if (p[0] == 'resize') {
                self.isResizing = true;
            }
            self.selectAFace(position.left, position.top, position.width, position.height);
            self.currentFace = position;
            self.facesPosition = newFacesPosition;
        }
    });

    this.canvas.mouseup(function(e) {
        self.paint = false;
        if (self.isMoving) {
            var p = utils.getPosition(e, self.canvas.offset());
            self.currentFace.top = p.top - self.isMoving.offsetY;
            self.currentFace.left = p.left - self.isMoving.offsetX;
            self.facesPosition.push(self.currentFace);
        } else {
            var f = utils.getFace(e, self.canvas.offset(), self.currentFace);
            if (f.width > 0 && f.height > 0) {
                self.facesPosition.push(f);
            }
        }
        self.refreshCanvas();
        self.currentFace = {};
        self.isMoving = false;
        self.isResizing = false;
    });

    this.canvas.mousemove(function(e) {
        var position = utils.getPosition(e, self.canvas.offset());
        var aux = utils.getFaceAndAssociatedAction(position, self.facesPosition);
        if (aux) {
            var position = aux[1];
            var newFacesPosition = aux[2];
            if (aux[0] == 'move') {
                document.body.style.cursor = 'move';
            } else if (aux[0] == 'resize') {
                document.body.style.cursor = 'se-resize';
            }
        } else {
            document.body.style.cursor = 'default';
        }

        if (!self.paint) {
            return null;
        }
        var p;
        if (self.isMoving) {
            self.refreshCanvas();
            self.selectAFace(position.left - self.isMoving.offsetX, position.top - self.isMoving.offsetY,
                             self.currentFace.width, self.currentFace.height);
        } else if (self.isResizing) {
            p = utils.getFace(e, self.canvas.offset(), self.currentFace);
            self.refreshCanvas();
            self.selectAFace(p.left, p.top, p.width, p.height);
        } else {
            p = utils.getFace(e, self.canvas.offset(), self.currentFace);
            self.refreshCanvas();
            self.paintAFace(p.left, p.top, p.width, p.height);
        }
    });

    this.canvas.mouseout(function(e) {
        if (!self.paint) {
            return null;
        }
        if (self.isMoving) {
            self.refreshCanvas();
            self.isMoving = false;
            self.currentFace = {};
        }
    });

    $('#btn-save').click(function(e) {
        utils.saveFace(self);
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
        if ((e.which >= 48 && e.which <= 57) || e.which == 8) {
            self.index = parseInt($(this).val() || '0', 10) - 1;
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
    $('#generate-file').click(function(e) {
        $.post('/generate_file').done(function() {
            alert('The file was generated correctly');
        }).fail(function() {
            alert('The file was not generated correctly. There was an error!!');
        });
    });
    $('#hide-inspected-images').click(function(e) {
        var allImages = $('#all-images img'),
            ls = [], i;

        for (i = 0; i < allImages.length; i++) {
            if (!self.allFacesPosition[allImages[i].src])
                ls.push(allImages[i]);
        };

        self.listImages = ls;
        self.currentFace = {};
        self.facesPosition = [];
        self.refreshCanvas();
    });
    $('#show-inspected-images').click(function(e) {
        self.listImages = $('#all-images img'),
        self.refreshCanvas();
    });
    $('body').keyup(function(e) {
        if (e.target.id != 'number-img' && e.which == CHARCODE_SAVE)
            utils.saveFace(self);
    });
};

var utils = {
    getFaceAndAssociatedAction: function(position, listFacesPositions) {
        var i, p, newList, actions = ['resize', 'move'];
        for (i = 0; i < listFacesPositions.length; i++) {
            p = listFacesPositions[i];
            move = (position.left >= p.left && position.left <= p.left + p.width &&
                position.top >= p.top && position.top <= p.top + p.height);
            resize = (Math.abs(position.left - (p.left + p.width)) < p.width * RESIZE_MARGIN &&
                Math.abs(position.top - (p.top + p.height)) < p.height * RESIZE_MARGIN);
            if (resize) {
                return ['resize', p, listFacesPositions.slice(0, i).concat(listFacesPositions.slice(i + 1))];
            } else if (move) {
                return ['move', p, listFacesPositions.slice(0, i).concat(listFacesPositions.slice(i + 1))];
            }
        }
        return null;
    },
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
    },
    saveFace: function(element) {
        if (element.index >= element.listImages.length) {
            alert('There is no another image!!!!');
            return false;
        }
        element.allFacesPosition[element.listImages[element.index].src] = element.facesPosition;
        $.post('/save_faces_position', {
            'src': element.listImages[element.index].src,
            'position': JSON.stringify(element.facesPosition)
        });
        element.showNextImage();
    }
};

var editor;
var BORDER_COLOR = 'yellow';
var SELECTED_FACE_BORDER_COLOR = 'red';
var INSIDE_COLOR = 'transparent';
var RESIZE_MARGIN = 0.20;
var CHARCODE_SAVE = 83;  // Letter s.
$('#all-images img').attr('crossOrigin', 'Anonymous');
$('body').ready(function () {
    editor = new Editor();
});
