var svgdoc;
var x;
var y;

function init(evt) {
    svgdoc = evt.target.ownerDocument;

    //var svg_img = svgdoc.createElementNS('http://www.w3.org/2000/svg', 'image');
    //svg_img.href.baseVal = "square_green.png";
    //svg_img.setAttribute('x', 50);
    //svg_img.setAttribute('y', 50);
    //svg_img.setAttribute('width', 20);
    //svg_img.setAttribute('height', 20);
    //svgdoc.documentElement.appendChild(svg_img);

}

function allowDrop(evt) {
    evt.preventDefault();
}

function drop(evt) {
    evt.preventDefault();
    var data = evt.dataTransfer.getData("Text");
    //ev.target.appendChild(document.getElementById(data));

    x = evt.clientX;
    y = evt.clientY;

    //存放坐标和id  
    setCookie('id',data);
    setCookie('x', x);
    setCookie('y', y);
    
    //刷新父页面
    top.document.location.reload();
    //var svg_img = svgdoc.createElementNS('http://www.w3.org/2000/svg', 'image');

    //switch (data) {
    //    case "drag1":
    //        svg_img.href.baseVal = "icon-20101-5.png"; break;
    //    case "drag2":
    //        svg_img.href.baseVal = "icon-20701-5.png"; break;
    //    case "drag3":
    //        svg_img.href.baseVal = "icon-30002-5.png"; break;
    //    case "drag4":
    //        svg_img.href.baseVal = "icon-20201-5.png"; break;
    //    case "drag5":
    //        svg_img.href.baseVal = "icon-20402-5.png"; break;
    //    case "drag6":
    //        svg_img.href.baseVal = "icon-20205-5.png"; break;
    //}

    //svg_img.setAttribute('id', data);
    //svg_img.setAttribute('x', x);
    //svg_img.setAttribute('y', y);
    //svg_img.setAttribute('width', '20');
    //svg_img.setAttribute('height', '20');
    //svgdoc.documentElement.appendChild(svg_img);
}