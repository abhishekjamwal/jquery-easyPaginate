(function($, window){

  var EasyPaginate;

  EasyPaginate = (function(){
    EasyPaginate.prototype.defaults = {
      pageClassNameBase:                 "easyPaginatePage_",
      nextButtonId:                     "next-button",           // REQUIRED The id of the button/link that advances to the next page of items.
      prevButtonId:                     "prev-button",           // REQUIRED The id of the button/link that reverts to the previous page of items.
      pageNumberClass:                   "page-number",
      itemClassName:                    "",           // REQUIRED The class name assignened to each item in the list.
      pageNumberId:                     "page-number",           // REQUIRED IF YOU WANT TO SHOW PAGE NUMBERS.
      numberOfItemsAccross:              1,           // REQUIRED IF FIXED PAGINATION IS TRUE. Sets the maximum number of items that can fit horizontally on a page.
      numberOfItemsDown:                 1,           // REQUIRED IF FIXED PAGINAITON IS TRUE. Sets the maximum number of items that can fit vertically on a page.
      fixedPagination:                true,           // OPTIONAL Set to true if you want to use fixed pagination. Use this if you know that all of the items are of the same dimentions.
      startingPageNumber:                 1,          // OPTIONAL Set the page of items that you would like to display by default when the page loads.
      controlModifier:          "visibility",         // OPTIONAL Set the way in which the next and prev buttons/links will be hidden (display or visibility)
      afterChangePageCallBack:         function(){},  // Run a call back after a new page is shown. Called after initialization.
    };

    function EasyPaginate(element, options) {
      this.$element = $(element);
      this.options = $.extend({}, this.defaults, options);
      this.controlModifierOn =      (this.options.controlModifier == 'display') ? "inline" : "visible"
      this.controlModifierOff =     (this.options.controlModifier == 'display') ? "none" : "hidden"
      this.nextButton =             $("#"+this.options.nextButtonId)
      this.prevButton =             $("#"+this.options.prevButtonId)
      this.pageNumbers =            $("." + this.options.pageNumberClass)
      this.pageNumber =             (this.options.pageNumberId != "") ? $("#"+this.options.pageNumberId) : ""
      this.items =                  this.$element.find('.' + this.options.itemClassName)
      this.currentPageNumber =      this.options.startingPageNumber
      this.maxPageArea =            0
      this.maxItemsPerPage =        0
      this.totalPages =             0
      this.paginate();
    };

    EasyPaginate.prototype.paginate = function(){
      this.setPageAreaOrMaxItems();
      this.$element.css('display', 'block');
      this.options.fixedPagination ? this.fixedPaginate() : this.dynamicPaginate();

      this.nextButton.unbind("click")
      this.prevButton.unbind("click")

      this.nextButton.click((function(_this){
        return function() {
          if (_this.currentPageNumber < _this.totalPages) {
            _this.changePage(++_this.currentPageNumber);
          }
          return false;
        };
      })(this));

      this.prevButton.click((function(_this){
        return function() {
          if (_this.currentPageNumber > 1) {
            _this.changePage(--_this.currentPageNumber);
          }
          return false;
        }
      })(this));

      this.pageNumbers.click((function(_this){
        return function(event) {
          console.log($(event.target))
          pageNumber = $(event.target).find("a").text()
          _this.changePage(pageNumber);
          return false;
        }
      })(this));

      this.changePage(this.currentPageNumber)

      return this;
    };

    EasyPaginate.prototype.setPageAreaOrMaxItems = function() {
      if ( (this.options.numberOfItemsAccross > 0) && (this.options.numberOfItemsDown > 0) ){
        this.maxItemsPerPage = this.options.numberOfItemsAccross * this.options.numberOfItemsDown;
      }
      else{
        this.maxPageArea = this.$element.css("height").match(/\d*/) * this.$element.css("width").match(/\d*/); //Must use css property to work in IE.
      }
      return this;
    };

    EasyPaginate.prototype.fixedPaginate = function() {
      var pageNumber = 1;
      var totalItemsOnCurrentPage = 1;

      if (this.items.length > 0){
        this.totalPages = 1;
      }

      // Clear existing classes
      $(this.items).removeClass( (function(_this){
        return function(index, css){
          regex = new RegExp("(" + _this.options.pageClassNameBase + "\\d*)", "g")
          return (css.match(regex) || []).join(" ");
        };
      })(this));

      this.items.each( (function(_this) {
        return function(index, item) {
          item = $(item);

          if (totalItemsOnCurrentPage > _this.maxItemsPerPage) {
            pageNumber++
            totalItemsOnCurrentPage = 1;
            _this.totalPages++;
          }
          className = _this.options.pageClassNameBase + pageNumber;
          if (!item.hasClass(className)){
            item.addClass(className);
          }
          totalItemsOnCurrentPage++;
        };
      })(this));
      return this;
    };

    EasyPaginate.prototype.dynamicPaginate = function() {
      var pageNumber = 1;
      var newContentArea = 0;
      var className;

      this.items.each( (function(_this) {
        return function() {
          newContentArea += _this.$element.fullArea();
          className = _this.$element.attr("class");
          if (newContentArea <= this.maxPageArea) {
            className = className + " " + _this.options.pageClassNameBase + pageNumber;
          }
          else{
            className = className + " " + _this.options.pageClassNameBase + (++pageNumber);
            newContentArea = $(this).fullArea();
            this.totalPages++;
          }
          _this.$element.attr("class", className);
        };
      })(this));
      return this;
    };

    EasyPaginate.prototype.changePage = function(pageNumber){
      var newContentGroup = $('#'+this.$element.attr("id") + ' .' + this.options.pageClassNameBase + pageNumber);
      if (newContentGroup != null){
        this.displayNoItems();
        newContentGroup.each(function(index) {
          $(this).css('display', 'block');
        });
        this.currentPageNumber = pageNumber;
      }
      this.options.afterChangePageCallBack(this, this.currentPageNumber, this.totalPages);
      return this;
    };

    EasyPaginate.prototype.displayNoItems = function (){
      this.items.each( (function(_this) {
        return function(index, item) {
          item = $(item)
          item.css('display', 'none');
        };
      })(this));
      return this;
    };

    return EasyPaginate;

  })();

  $.fn.fullArea = function(){
    var element = $(this);
    $.extend(element,{
      fullHeight: function() {
         var totalHeight = 0;
         $.each(["border", "padding", "margin"], function(){
           totalHeight += element.convertToInt(element.css(this+"-top"));
           totalHeight += element.convertToInt(element.css(this+"-bottom"));
         });
         return (totalHeight += element.height());
       },

       fullWidth: function() {
         var totalWidth = 0;
         $.each(["border", "padding", "margin"], function(){
           totalWidth += element.convertToInt(element.css(this+"-right"));
           totalWidth += element.convertToInt(element.css(this+"-left"));
         });
         return (totalWidth += element.width());
       },

       convertToInt:  function(value) {
         value = value.replace("px", "");
         return value == "" ? 0 : parseInt(value);
       }
    });

    return element.fullHeight() * element.fullWidth();
  };

  return $.fn.extend({
    easyPaginate: function(options) {
      return this.each(function() {
        $this = $(this)
        $this.data("EasyPaginate", new EasyPaginate(this, options));
      });
    }
  });
})(window.jQuery, window);
