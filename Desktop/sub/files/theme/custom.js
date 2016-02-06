jQuery(function($) {

  // Define Theme specific functions
  var Theme = {
    // Swiping mobile galleries wwith Hammer.js
    swipeGallery: function() {
      setTimeout(function() {
        var touchGallery = document.getElementsByClassName("fancybox-wrap")[0];
        var mc = new Hammer(touchGallery);
        mc.on("panleft panright", function(ev) {
          if (ev.type == "panleft") {
            $("a.fancybox-next").trigger("click");
          } else if (ev.type == "panright") {
            $("a.fancybox-prev").trigger("click");
          }
          Theme.swipeGallery();
        });
      }, 500);      
    },
    swipeInit: function() {
      if ('ontouchstart' in window) {
        $("body").on("click", "a.w-fancybox", function() {
          Theme.swipeGallery();
        });
      }
      // Add fullwidth class to gallery thumbs if less than 6
      $('.imageGallery').each(function(){
        if ($(this).children('div').length <= 6) {
          $(this).children('div').addClass('fullwidth-mobile');
        }
      });
    },
    // Show/hide header when scrolling
    scrollHide: function(scrollpane, target) {
      var prevScroll = 0,
          current = 'down',
          previous = 'up',
          distance = $(target).height();      
      $(scrollpane).scroll(function(){
        if ($(this).scrollTop() >= prevScroll + 10) {
          current = 'down';
          if (current != previous) {
            $(target).css({ top: '-'+ (distance + 10) +'px' });
            previous = current;
          }
        } 
        else if ($(this).scrollTop() < prevScroll - 5) {
          current = 'up';
          if (current != previous) {
            $(target).css({ top: '0px' });
            previous = current;
          }
        }
        prevScroll = $(this).scrollTop();
      });
    },
    // Form Styling
    formstyle: function(){
      // Sublabels into placeholders
      $(".wsite-form-sublabel").each(function(){
        var sublabel = $(this).text();
        $(this).prev('input').attr("placeholder", sublabel);
      });
    },
    // Category + Search sidebar dropdown on mobile
    toggleOpen: function(sidebar){
      $(sidebar).click(function(){
        $(this).toggleClass("open");
      });
    },
    // Interval function to execute post-post-load events
    interval: function(condition, action, duration, limit) {
      var counter = 0;
      var looper = setInterval(function(){
        if (counter >= limit || Theme.checkElement(condition)) {
          clearInterval(looper);
        } else {
          action();
          counter++;
        }
      }, duration);
    },
    checkElement: function(selector) {
      return $(selector).length;
    },
    moveCartLink: function() {
      if ($("#wsite-nav-cart-num").text().length && $("#wsite-nav-cart-num").text() != "-") {
        var cart = $(".wsite-nav-cart").detach();
        $(".icons .close").before(cart);
        $("#wsite-nav-cart-a").click(function(e){
          e.preventDefault();
    		  $('#menu-input').prop('checked', false);
          $("body").addClass("open");
          $("#cart").addClass("active");
        });
        $("#wsite-com-product-add-to-cart").on('click', function() {
          $('#content').animate({scrollTop : 0},350);
          setTimeout(function(){ $("#wsite-nav-cart-a").addClass("emphasize"); }, 900);
          setTimeout(function(){ $("#wsite-nav-cart-a").removeClass("emphasize"); }, 2400);
        });          
        
      }
    },
    moveMinicart: function() {
      var move = $("#wsite-mini-cart").detach();
      $("#cart .container").append(move);
    },
    moveLogin: function() {
      var login = $('#member-login').detach();
      $("#nav .wsite-menu-default > li:last-child").after(login);
    },
    padHeader: function(header, container){
      $(container).css({"padding-top" : $(header).height() + "px"});
    },
    searchSwap: function(){
      if ($(".icons .wsite-search").is(":visible")) {
        var search = $(".icons .wsite-search").detach();
        $("#search .container").append(search);
        $(".icons").prepend('<a href="#" class="wsite-search-button"></a>');
        $(".icons .wsite-search-button").click(function(e){
          e.preventDefault();
    		  $('#menu-input').prop('checked', false);
          $("body").addClass("open");
          $("#search").addClass("active");
          $("#search .wsite-search-input").focus();
        });
      }
    },
    closePanel: function(close){
      $(".close, .overlay").click(function(e){
        e.preventDefault();
        $("body").removeClass("open");
        $("#header .active").removeClass("active");
        $('#menu-input').prop('checked', false);
  		});
    },
    carouselInit: function(){
      var size = function(){
        var maxHeight = 0;
        $('#wsite-com-product-images .item').each(function() {
          maxHeight = maxHeight > $(this).height() ? maxHeight : $(this).height();
        }); 
        $("#wsite-com-product-images #product-carousel").height(maxHeight);
      }
      size();
      // Adjust if resized
      var resize = _.debounce(function(e) {
        size();
      }, 500);
      window.addEventListener("resize", resize, false);
      
      $("#product-carousel .carousel-inner .item:first-child, #product-carousel .carousel-indicators li:first-child").addClass("active");
      var indexPos = 0;
      $("#product-carousel .carousel-indicators li").each(function(){
        $(this).attr("data-slide-to", indexPos);
        indexPos++;
      });
      $('#product-carousel').carousel();
      $('.carousel-indicators li').click(function(e){
        e.stopPropagation();
        var goTo = $(this).data('slide-to');
        $('.carousel-inner .item').each(function(index){
          if ($(this).data('id') == goTo){
            goTo = index;
            return false;
          }
        });

        $('#product-carousel').carousel(goTo); 
      });
    },
    submenu: function(){
      // Clone the subnav links for editor functionality
      $(".subnav-link").each(function(){
        var clickable = $(this).clone(true, true);
        $(this).after(clickable);
        $(this).unbind();
        $(this).next(".subnav-link").addClass("editor-subnav");
      });

      $("#header").on("click", ".subnav-link:not(.expanded, .editor-subnav)", function(e){
        e.preventDefault();
        $(this).closest("ul").find(".expanded").removeClass("expanded");
        $(this).addClass("expanded");
        $("#nav").addClass("submenu-expanded");

        // Add sliding submenus if desktop/mobile
        if ($(window).width() >= 768) {
          var menuID = $(this).attr("data-submenu"),
              menu = $("#"+menuID).clone(true, true);
          $(this).parents(".nav").after('<div class="nav submenu slide-panel ' + menuID + '"><div class="container"></div></div>');
          $('.'+menuID + " .container").append(menu);
          setTimeout(function(){ $('.'+menuID).addClass("active"); }, 300);
          $('.'+menuID).nextAll(".nav").slideUp(300, function(){
            $(this).remove()
          });
        }
      });

      // Reset when menu closes
      $("#menu-input").change(function() {
        var checked= $(this).is(':checked');
        if(!checked) {
          $('.submenu').delay(300).slideUp(300, function(){
            $(this).remove()
          });
          $(".expanded").removeClass("expanded");
          $("#nav").removeClass("submenu-expanded");
        }
      });
    }
  }

  $(document).ready(function() {
    $("body").addClass("postload");
    Theme.padHeader("#header", "#banner");
    setTimeout(function(){
      Theme.submenu();
    }, 600);
    Theme.interval("#cart #wsite-mini-cart", Theme.moveMinicart, 800, 5);
    Theme.interval(".icons > .wsite-nav-cart", Theme.moveCartLink, 800, 5);
    Theme.interval("#nav #member-login", Theme.moveLogin, 800, 5);
    Theme.searchSwap();
    Theme.closePanel();
    if ($("#icontent").length > 0) {
      Theme.scrollHide(window, "#header");
    }
    else {
      Theme.scrollHide("#content", "#header");
    }
    Theme.toggleOpen(".wsite-com-sidebar, .blog-social, #wsite-search-sidebar, #wsite-com-product-short-description, .wsite-product-description");
    Theme.swipeInit();
    Theme.formstyle();
    Theme.carouselInit();
  });

});