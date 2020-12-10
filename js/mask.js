class Mask {
  constructor(id, img, scale) {
    this.id = id;
    this.scale = scale;

    this.dataList = [];
    this.hideCount = 0;

    let imgNode = document.createElement('img');
    imgNode.id = id;
    imgNode.classList.add('mask');
    imgNode.src = img;
    $('#content').append(imgNode);
  }

  setImage(img) {
    $('#' + this.id).attr('src', img);
  }

  update(x, y, width, height) {
    let mx = this.scale * width - width;
    let my = this.scale * height - height;
    x -= mx;
    y -= my + height * 0.25;
    width += mx * 2;
    height += my * 2;

    this.dataList.push({'x': x, 'y': y, 'width': width, 'height': height});
    if (this.dataList.length > 5) {
      this.dataList.shift();
    }

    let sumX = 0;
    let sumY = 0;
    let sumW = 0;
    let sumH = 0;
    this.dataList.forEach(d => {
      sumX += d.x;
      sumY += d.y;
      sumW += d.width;
      sumH += d.height;
    });
    let cnt = this.dataList.length;

    $('#' + this.id).show();
    $('#' + this.id).css('left', sumX / cnt);
    $('#' + this.id).css('top', sumY / cnt);
    $('#' + this.id).css('width', sumW / cnt);
    $('#' + this.id).css('height', sumH / cnt);

    this.hideCount = 0;
  }

  hide() {
    if (this.hideCount > 10) {
      this.dataList = [];
      $('#' + this.id).hide();
    }
    this.hideCount++;
  }
}
