$.ajax({
    url: "/mylovfnt/",
    type: "POST",
    success: function(data) {
        for (i=0;i<data.length;i++) {
            dt=data[i];
            index = theDay(dt.course_day, dt.course_start);
            for (j = 1; j + 1 <= dt.course_end; j++) {
                $(".curriculum div")
                    .eq(index + j * 7)
                    .hide();
            }
            $(".curriculum div")
                .eq(index)
                .html(
                    dt.course_name +
                        "<br>" +
                        dt.course_list +
                        "<br>" +
                        dt.teacher
                )
                .css("height", heightX(dt.course_end) + "px");
        }
    },
    error: function() {
        alert("服务器请求超时,请重试!");
    }
});

for (i = 0; i < 7 * 12; i++)
    $(".curriculum").append(
        '<div class="height1" ondrop="drop(event,this)" ondragover="allowDrop(event)" draggable="true" ondragstart="drag(event, this)"></div>'
    );

function allowDrop(ev) {
    ev.preventDefault();
}

var srcdiv = null;
var index, x, y;
function drag(ev, divdom) {
    srcdiv = divdom;
    ev.dataTransfer.setData("text/html", divdom.innerHTML);
}

function heightX(x) {
    return x * 35 - 5;
}

function indexX(h) {
    return (h + 5) / 35;
}

function theDay(x, y) {
    return x - 1 + (y - 1) * 7;
}

function drop(ev, divdom) {
    ev.preventDefault();
    x = indexX(parseInt($(divdom).css("height")));
    y = indexX(parseInt($(srcdiv).css("height")));
    if (
        $(".message div").index(srcdiv) > -1 &&
        $(".curriculum div").index(divdom) > -1
    ) {
        if (!$(divdom).hasClass("hotDay")) return;
        var index1 = $(".curriculum div").index(divdom);
        if (index1 + y * 7 - 7 > 83) return;
        for (i = x; i + 1 <= y; i++) {
            if (
                parseInt(
                    $(".curriculum div")
                        .eq(index1 + i * 7)
                        .css("height")
                ) > 30
            )
                return;
        }
        for (i = x; i + 1 <= y; i++) {
            $(".curriculum div")
                .eq(index1 + i * 7)
                .hide();
        }
        for (i = y; i + 1 <= x; i++) {
            $(".curriculum div")
                .eq(index1 + i * 7)
                .show();
            $(".curriculum div")
                .eq(index1 + i * 7)
                .css("height", "30px");
        }
        if (srcdiv != divdom) {
            $(divdom).css("height", heightX(y));
            $(srcdiv).css("height", heightX(x));
            srcdiv.innerHTML = divdom.innerHTML;
            divdom.innerHTML = ev.dataTransfer.getData("text/html");
        }
    } else if (
        $(".curriculum div").index(srcdiv) > -1 &&
        $(".trash").index(divdom) > -1
    ) {
        var index1 = $(".curriculum div").index(srcdiv);
        for (i = 0; i < y; i++) {
            $(".curriculum div")
                .eq(index1 + i * 7)
                .html("");
            $(".curriculum div")
                .eq(index1 + i * 7)
                .show();
            $(".curriculum div")
                .eq(index1 + i * 7)
                .css("height", "30px");
        }
    } else if (false) {
        var index1 = $(".curriculum div").index(divdom);
        var index2 = $(".curriculum div").index(srcdiv);
        if (index2 + x * 7 - 7 > 83) return;
        if (index1 + y * 7 - 7 > 83) return;
        for (i = x; i + 1 <= y; i++) {
            if (
                parseInt(
                    $(".curriculum div")
                        .eq(index1 + i * 7)
                        .css("height")
                ) > 30
            )
                return;
        }
        for (i = y; i + 1 <= x; i++) {
            if (
                parseInt(
                    $(".curriculum div")
                        .eq(index2 + i * 7)
                        .css("height")
                ) > 30
            )
                return;
        }
        for (i = x; i + 1 <= y; i++) {
            $(".curriculum div")
                .eq(index1 + i * 7)
                .hide();
            $(".curriculum div")
                .eq(index2 + i * 7)
                .show();
            $(".curriculum div")
                .eq(index2 + i * 7)
                .css("height", "30px");
        }
        for (i = y; i + 1 <= x; i++) {
            $(".curriculum div")
                .eq(index2 + i * 7)
                .hide();
            $(".curriculum div")
                .eq(index1 + i * 7)
                .show();
            $(".curriculum div")
                .eq(index1 + i * 7)
                .css("height", "30px");
        }
        if (srcdiv != divdom) {
            $(divdom).css("height", heightX(y));
            $(srcdiv).css("height", heightX(x));
            srcdiv.innerHTML = divdom.innerHTML;
            divdom.innerHTML = ev.dataTransfer.getData("text/html");
        }
    }
}

$(".curriculum div").each(function(index, e) {
    $(this).offset({
        top: Math.floor(index / 7) * 35 + 50,
        left: (index % 7) * 85 + 200
    });
});
$(".curriculum div").each(function(index, e) {
    if ($(this).css("height") == "20px") $(this).hide();
});

$(".message").delegate("div", "mouseover", function() {
    var x = $(this).attr("day"),
        y = $(this).attr("start");
    $(".curriculum div")
        .eq(theDay(x, y))
        .addClass("hotDay");
    $(this).addClass("hotDay");
});

$(".message").delegate("div", "mouseout", function() {
    var x = $(this).attr("day"),
        y = $(this).attr("start");
    $(".curriculum div")
        .eq(theDay(x, y))
        .removeClass("hotDay");
    $(this).removeClass("hotDay");
});

$(".logout").click(function() {
    $(location).attr("href", "/logout/");
});

$("#submit").click(function() {
    var post_data = {
        course_number: $(":input").val()
    };

    $.ajax({
        url: "/index/",
        type: "POST",
        data: post_data,

        success: function(data) {
            $(".curriculum div").each(function(index, e) {
                $(this).removeClass("theDay");
            });
            $(".message").html("");
            var mx1 = 0,
                sum = 0;
            $.each(data, function(index, value) {
                if (index % 10 == 0) {
                    sum += mx1;
                    mx1 = 0;
                }
                var len = value.course_end;
                mx1 = Math.max(mx1, len);
                $(".curriculum div")
                    .eq(theDay(value.course_day, value.course_start))
                    .addClass("theDay");
                $(".message").append(
                    '<div ondrop="drop(event,this)" ondragover="allowDrop(event)" draggable="true" ondragstart="drag(event, this)" day="' +
                        value.course_day +
                        '" start="' +
                        value.course_start +
                        '">' +
                        value.course_name +
                        "<br>" +
                        value.course_list +
                        "<br>" +
                        value.teacher +
                        "</div>"
                );
                $(".message div:last")
                    .offset({
                        top: parseInt(index / 10) * 10 + heightX(sum) + 550,
                        left: (index % 10) * 85 + 200
                    })
                    .css("height", heightX(len) + "px");
            });
        },
        error: function() {
            alert("服务器请求超时,请重试!");
        }
    });
});

$("#save").click(function() {
    names = [];
    lists = [];
    $(".curriculum div").each(function(index, e) {
        t = $(this).html();
        if (t != "") {
            data = t.split("<br>");
            names.push(data[0]);
            lists.push(data[1]);
        }
    });
    post_data = {
        name: names,
        list: lists
    };

    $.ajax({
        url: "/save/",
        type: "POST",
        data: post_data,
        traditional: true,
        success: function(data) {
            alert("保存成功");
        },
        error: function() {
            alert("服务器请求超时,请重试!");
        }
    });
});
