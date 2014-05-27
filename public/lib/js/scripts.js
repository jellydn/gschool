//left side accordion
$(function() {
    $('#nav-accordion').dcAccordion({
        eventType: 'click',
        autoClose: true,
        saveState: true,
        disableLink: true,
        speed: 'slow',
        showCount: false,
        autoExpand: true,
        classExpand: 'dcjq-current-parent'
    });



});


var Script = function () {

    //  menu auto scrolling

    $( document ).on( "click", "#sidebar .sub-menu > a", function() {
        var o = ($(this).offset());
        var diff = 80 - o.top;
        if(diff>0)
            $("#sidebar").scrollTo("-="+Math.abs(diff),500);
        else
            $("#sidebar").scrollTo("+="+Math.abs(diff),500);
    });

    // toggle bar

    $(function() {
        var wd;
        wd = $(window).width();
        function responsiveView() {
            var newd = $(window).width();
            if(newd==wd){
                return true;
            }else{
                wd = newd;
            }
            var wSize = $(window).width();
            if (wSize <= 768) {
                $('#sidebar').addClass('hide-left-bar');

            }
        else{
                $('#sidebar').removeClass('hide-left-bar');
            }

        }
        $(window).on('load', responsiveView);
        $(window).on('resize', responsiveView);




    });

    $( document ).on( "click", ".sidebar-toggle-box .fa-bars", function(e) {
        $('#sidebar').toggleClass('hide-left-bar');
        $('#main-content').toggleClass('merge-left');
        e.stopPropagation();
        if( $('#container').hasClass('open-right-panel')){
            $('#container').removeClass('open-right-panel')
        }
        if( $('.right-sidebar').hasClass('open-right-bar')){
            $('.right-sidebar').removeClass('open-right-bar')
        }

        if( $('.header').hasClass('merge-header')){
            $('.header').removeClass('merge-header')
        }

    });
    
    $( document ).on( "click", ".toggle-right-box .fa-bars", function(e) {
        $('#container').toggleClass('open-right-panel');
        $('.right-sidebar').toggleClass('open-right-bar');
        $('.header').toggleClass('merge-header');

        e.stopPropagation();
    });
    $( document ).on( "click", ".header,#main-content,#sidebar", function(e) {
       if( $('#container').hasClass('open-right-panel')){
           $('#container').removeClass('open-right-panel')
       }
        if( $('.right-sidebar').hasClass('open-right-bar')){
            $('.right-sidebar').removeClass('open-right-bar')
        }

        if( $('.header').hasClass('merge-header')){
            $('.header').removeClass('merge-header')
        }


    });


   // custom scroll bar
    $("#sidebar").niceScroll({styler:"fb",cursorcolor:"#1FB5AD", cursorwidth: '3', cursorborderradius: '10px', background: '#404040', spacebarenabled:false, cursorborder: ''});
    $(".right-sidebar").niceScroll({styler:"fb",cursorcolor:"#1FB5AD", cursorwidth: '3', cursorborderradius: '10px', background: '#404040', spacebarenabled:false, cursorborder: ''});


   // widget tools
    $( document ).on( "click", ".panel .tools .fa-chevron-down,.panel .tools .fa-chevron-up", function() {
        var el = jQuery(this).parents(".panel").children(".panel-body");
        if (jQuery(this).hasClass("fa-chevron-down")) {
            jQuery(this).removeClass("fa-chevron-down").addClass("fa-chevron-up");
            el.slideUp(200);
        } else {
            jQuery(this).removeClass("fa-chevron-up").addClass("fa-chevron-down");
            el.slideDown(200);
        }
    });

    $( document ).on( "click", ".panel .tools .fa-times", function() {
        jQuery(this).parents(".panel").parent().remove();
    });

   // tool tips

    $('.tooltips').tooltip();

    // popovers

    $('.popovers').popover();

    // notification pie chart
    $(function() {
        $('.notification-pie-chart').easyPieChart({
            onStep: function(from, to, percent) {
                $(this.el).find('.percent').text(Math.round(percent));
            },
            barColor: "#39b6ac",
            lineWidth: 3,
            size:50,
            trackColor: "#efefef",
            scaleColor:"#cccccc"

        });

    });


    $(function() {

        var datatPie = [30,50];
// DONUT
        $.plot($(".target-sell"), datatPie,
            {
                series: {
                    pie: {
                        innerRadius: 0.6,
                        show: true,
                        label: {
                            show: false

                        },
                        stroke: {
                            width:.01,
                            color: '#fff'

                        }
                    }




                },

                legend: {
                    show: true
                },
                grid: {
                    hoverable: true,
                    clickable: true
                },

                colors: ["#ff6d60", "#cbcdd9"]
            });
    });

    $(function() {
        $('.pc-epie-chart').easyPieChart({
            onStep: function(from, to, percent) {
                $(this.el).find('.percent').text(Math.round(percent));
            },
            barColor: "#5bc6f0",
            lineWidth: 3,
            size:50,
            trackColor: "#32323a",
            scaleColor:"#cccccc"

        });

    });



    $(function() {
        $(".d-pending").sparkline([3,1], {
            type: 'pie',
            width: '40',
            height: '40',
            sliceColors: ['#e1e1e1','#8175c9']
        });
    });



// SPARKLINE
    $(function () {
        var sparkLine = function () {
            $(".sparkline").each(function(){
                var $data = $(this).data();
                ($data.type == 'pie') && $data.sliceColors && ($data.sliceColors = eval($data.sliceColors));
                ($data.type == 'bar') && $data.stackedBarColor && ($data.stackedBarColor = eval($data.stackedBarColor));

                $data.valueSpots = {'0:': $data.spotColor};
                $(this).sparkline( $data.data || "html", $data);


                if($(this).data("compositeData")){
                    $spdata = $(this).data("compositeConfig");
                    $spdata.composite = true;
                    $spdata.minSpotColor = false;
                    $spdata.maxSpotColor = false;
                    $spdata.valueSpots = {'0:': $spdata.spotColor};
                    $(this).sparkline($(this).data("compositeData"), $spdata);
                };
            });
        };

        var sparkResize;
        $(window).resize(function (e) {
            clearTimeout(sparkResize);
            sparkResize = setTimeout(function () {
                sparkLine(true)
            }, 500);
        });
        sparkLine(false);
    });

    /*==Collapsible==*/
    $(function() {
        $( document ).on( "click", ".widget-head", function(e) 
        {
            var widgetElem = $(this).children('.widget-collapse').children('i');

            $(this)
                .next('.widget-container')
                .slideToggle('slow');
            if ($(widgetElem).hasClass('ico-minus')) {
                $(widgetElem).removeClass('ico-minus');
                $(widgetElem).addClass('ico-plus');
            }
            else
            {
                $(widgetElem).removeClass('ico-plus');
                $(widgetElem).addClass('ico-minus');
            }
            e.preventDefault();
        });

    });

//    $(function() {
//
//    $('.todo-check label').click(function(){
//        var n = $(this).parents('li input[type="checkbox"]');
//        if ($(n).is(':checked')){
//alert('tets');
//        }
//        else{
//            alert('none');
//        }
//
//    });
//
//    });
}();

