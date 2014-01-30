(function($)
{

$.fn.zGrid = function(params) {

      this.params = {};

      if ( params && params.size) {
        this.params.size = params.size;
      }

      if ( params && params.col) {
        this.params.col = params.col;
      }

      // gestion multiple object
      if($(this).length > 1) {

        var listzGrid = new Array();

        $(this).each(function(index, item) {
          zGridItem = $(item).zGrid(params);

          listzGrid.push(zGridItem);

        });

        this.listzGrid = listzGrid;

      } else {

        if(params.attrId) {
          this.params.attrId = params.attrId;
        } else {
          this.params.attrId = 'data-id';
        }

        var that = this;

        paramSortable = {
          tolerance: "pointer",
          revert : false,
          handle: '.handle',
          placeholder: {
              element: function(clone, ui) {
                    if($(clone).attr('data-width')) {
                      dataWidth = "data-width='"+$(clone).attr('data-width')+"'";
                    } else {
                      dataWidth = "";
                    }
                    if($(clone).attr('data-height')) {
                      dataHeight = "data-height='"+$(clone).attr('data-height')+"'";
                    } else {
                      dataHeight = "";
                    }
                    if(that.params.attrId && $(clone).attr(that.params.attrId)) {
                      dataId = that.params.attrId+"='"+$(clone).attr(that.params.attrId)+"'";
                    } else {
                      dataId = "";
                    }

                    return $('<li class="'+$(clone).attr('class')+' highlight" '+dataId+' '+dataWidth+' '+dataHeight+'></li>');
              },
              update: function() {
                return true;
              },
          },
          update: function() {
              that.update(that);
          },
          stop: function() {
              that.stop(that);
          },
        };

        if (params.sortable) {
          var paramSortable = $.extend( paramSortable, params.sortable );
        }

        $(this).sortable(paramSortable);

        window.onresize = function(event) {
            that.clalcGrid(true);
        }

        setInterval(function() {
            that.clalcGrid();
        }, 100);

      }

    this.clalcGrid = function(force) {


        if( !force && this.zGridOlder && this.zGridOlder == $(this).html()) {
          return false;
        }

        if(this.params.col) {
          var zGridCol = this.params.col;
        }

        var zGridMinSize = 250; // min size

        if(this.params.size) {
          var zGridSize = this.params.size;
        } else {
          var maximumWidth = 1;

          $(this).find('li[data-width]').each(function(index, item) {
            var value = parseFloat($(this).attr('data-width'));
            maximumWidth = (value > maximumWidth) ? value : maximumWidth;
          });
          var zGridMinSize = Math.floor($(this).width()/maximumWidth);
        }

        if(zGridSize && zGridSize < zGridMinSize) {
          var zGridSize = zGridMinSize;
        }
        
        // Gestion col and size
        if(!zGridCol && !zGridSize) {
          var zGridCol = Math.floor($(this).width()/zGridMinSize);
          var zGridSize = Math.floor($(this).width()/zGridCol);
        } else if(zGridCol) {
          var zGridSize = Math.floor($(this).width()/zGridCol);
        } else if(zGridSize) {
          var zGridCol = Math.floor($(this).width()/zGridSize);
        }

        this.zGridOlder = $(this).html();

        this.tabArray = [];
        var nextCol = 0;
        var nextRow = 0;

        var that = this;

        $(that).find('li').each(function(index, gridItem) {

        if(!$(gridItem).hasClass("ui-sortable-helper")) {

          var item = {};

          item.name = $(gridItem).attr('data-title');

          if($(gridItem).attr('data-width')) {
            item.width = $(gridItem).attr('data-width')*zGridSize;
            $(gridItem).css('width', item.width);
          } else {
            item.width = $(gridItem).width();
            $(gridItem).css('width', zGridSize);
          }

          if($(gridItem).attr('data-height')) {
            item.height = $(gridItem).attr('data-height')*zGridSize;
            $(gridItem).css('height', item.height);
          } else {
            item.height = $(gridItem).height();
            $(gridItem).css('height', zGridSize);
          }

          // Calc nombre collone
          if(item.height > zGridSize) {
            nbCol = Math.round(item.height/zGridSize);
          } else {
            nbCol =1;
          }

          // Calc nombre row
          if(item.width > zGridSize) {
            nbRow = Math.round(item.width/zGridSize);
          } else {
            nbRow = 1;
          }

          // Calc prochaine position accessible
          resultRow = that.getNextRow(that.tabArray, nextRow, nextCol, nbRow, zGridCol);

          nextRow = resultRow.nextRow;
          nextCol = resultRow.nextCol;

          if(nextRow+nbRow > zGridCol) {
            nextRow = 0;
            nextCol++;
          }

          // Insertion des ellements dans le tableau
          for (addCol=0; addCol < nbCol; addCol++) {

              if(!that.tabArray[nextCol+addCol]) {
                that.tabArray[nextCol+addCol] = [];
              }

              for (addRow=0; addRow < nbRow; addRow++) {
                that.tabArray[nextCol+addCol][nextRow+addRow] = item;
              }

          }
         
          if(!that.tabArray[nextCol]) {
            that.tabArray[nextCol] = [];
          }

          that.tabArray[nextCol][nextRow] = $(gridItem);

          nextRow += nbRow;

         }

        }).promise().done(function(){
         
          var maxTop = 0;
          var position = 0;

          that.serializeData = [];

          $(that.tabArray).each(function(col, rows) {

            $(rows).each(function(row, data) {

              var retourCss = $(data).css({top:zGridSize*col, left:zGridSize*row});
              maxTop = zGridSize*col;

              if($(data).html() != undefined) { // on verifie que c'est un item HTML
                
                that.serializeData[position] = $(data);
                position++;
              }

            });

          });

          $(that).css('height',maxTop+zGridSize);

        });

    }

    this.set = function(target, data) {
         // if multiple instance set in all
        if (this.listzGrid) {
          $(this.listzGrid).each(function(index, item){
            item.set(target, data);
          });
        } else {
          this.params[target] = data;
          this.clalcGrid(true);
        }
    }

    this.add = function(item, pos) {

        // if multiple instance add in first
        if (this.listzGrid) {
          this.listzGrid[0].add(item, pos);
        } else {

          if(pos == 'prepend') {
            $(this).prepend($(item));
          } else {
            $(this).append($(item));
          }
          
          this.clalcGrid(true);
        }

    }

    this.update = function() {
      console.log('init update');
    }

    this.stop = function() {
      console.log('init stop');
    }    

    this.serialize = function() {

      if (this.listzGrid) {
          var allSerialize = {};
          $(this.listzGrid).each(function(index, item){
            allSerialize[index] = this.serializeData;
          });
          return allSerialize;
      } else {
         return this.serializeData;
      }

    }

    this.getNextRow = function(tabArray, nextRow, nextCol, nbRow, zGridCol) {

      var allPosLibre = false;

      if(nextRow+nbRow > zGridCol) {
        nextRow = 0;
        nextCol++;
      }

      var position = {
        row : nextRow,
        col : nextCol,
      };

      position.colSearch = position.col;
      position.rowSearch = position.row;

        while(allPosLibre != true) {

          if(position.row > zGridCol) {
            position.row = 0;
            position.col++;
          }

          allPosLibre = true;

          for(addRow= 0; addRow <= nbRow-1; addRow++) {

            position.rowSearch = position.row+addRow;

            if(position.rowSearch >= zGridCol) {
              position.row = 0;
              position.rowSearch = position.row+addRow;
              position.col++;
            }

            position.colSearch = position.col;

            if(!tabArray[position.colSearch]) {
                array = [];
                tabArray[position.colSearch] = array;
            }

            if (tabArray[position.colSearch][position.rowSearch] != undefined) {
                allPosLibre = false;
                position.row++;
            }

          }

        }

      result = { nextRow : position.row, nextCol : position.colSearch};
      return result;

    }

    // modification des functions update / stop
    if($(this).length <= 1) {

      if (params.update) {
        this.update = params.update;
      }

      if (params.stop) {
        this.stop = params.stop;
      }      

    }

    return this;

};

})(jQuery);