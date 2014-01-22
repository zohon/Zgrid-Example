
$.fn.zGrid = function(params) {

    if ( params && params.size) {
      window.zGridSize = params.size;
    }

    if(params && params.handle) {
      handle = params.handle;
    } else {
      handle = ".handle";
    }

    nameLi = "zGridItem";

    $(this).sortable({ 
      tolerance: "pointer",
      revert : false,
      handle: handle,
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
                return $('<li class="'+nameLi+' highlight" '+dataWidth+' '+dataHeight+'></li>');
          },
          update: function() {
            return true;
          },
      },
    });

    window.onresize = function(event) {
        clalcGrid($(this), true);
    }

    that = $(this);

    setInterval(function() {
      clalcGrid($(that));
    }, 50);

};

    function clalcGrid(target, force) {

        if(!force && window.zGridOlder && window.zGridOlder == $(target).html()) {
          return false;
        }

        if(!window.zGridSize) {
          var zGridSize = Math.round($(target).width()/4);
        } else {
          var zGridSize = window.zGridSize;
        }

        zGridMinSize = 180;
        if(zGridMinSize && zGridSize < zGridMinSize) {
          zGridSize = zGridMinSize;
        }

        if(!window.zGridCol) {
          var zGridCol = Math.round($(target).width()/zGridSize);
        } else {
          var zGridCol = window.zGridCol;
        }

        window.zGridOlder = $(target).html();

        tabArray = [];
        nextCol = 0;
        nextRow = 0;

        if (zGridCol < 2) {
          zGridCol = 2;
        }

        $(target).find('li').each(function(index, gridItem) {

        if(!$(gridItem).hasClass("ui-sortable-helper")) {

          item = {};

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
          resultRow = getNextRow(tabArray, nextRow, nextCol, nbRow, zGridCol);

          nextRow = resultRow.nextRow;
          nextCol = resultRow.nextCol;

          if(nextRow+nbRow > zGridCol) {
            nextRow = 0;
            nextCol++;
          }

          // Insertion des ellements dans le tableau
          for (addCol=0; addCol < nbCol; addCol++) {
              if(!tabArray[nextCol+addCol]) {
                tabArray[nextCol+addCol] = [];
              }
              tabArray[nextCol+addCol][nextRow] = item;
          }
            
          for (addRow=0; addRow < nbRow; addRow++) {
              tabArray[nextCol][nextRow+addRow] = item;
          }
         
          if(!tabArray[nextCol]) {
            tabArray[nextCol] = [];
          }

          tabArray[nextCol][nextRow] = $(gridItem);

          nextRow += nbRow;

         }

        }).promise().done(function(){
         
          $(tabArray).each(function(col, rows) {

            $(rows).each(function(row, data) {

              $(data).css({top:zGridSize*col, left:zGridSize*row});
            });


          });

        });

    }



    function getNextRow(tabArray, nextRow, nextCol, nbRow, zGridCol) {

      allPosLibre = false;

      if(nextRow+nbRow > zGridCol) {
        nextRow = 0;
        nextCol++;
      }

      position = {
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
            position.colSearch = position.col;

            if(position.rowSearch > zGridCol) {
              position.row = 0;
              position.col++;
            }


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