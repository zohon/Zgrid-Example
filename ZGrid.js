
    function clalcGrid(target, force) {

        if(!force && window.oldOrder && window.oldOrder == $(target).html() ) {
          return false;
        }

        window.oldOrder = $(target).html();

        tabArray = [];
        nextCol = 0;
        nextRow = 0;

        if (col < 2) {
          col = 2;
        }

        $(target).find('li').each(function(index, gridItem) {

        if(!$(gridItem).hasClass("ui-sortable-helper")) {

          item = {};

          item.name = $(gridItem).attr('data-title');

          if($(gridItem).attr('data-width')) {
            item.width = $(gridItem).attr('data-width')*tailleItem;
            $(gridItem).css('width', item.width);
          } else {
            item.width = $(gridItem).width();
            $(gridItem).css('width', tailleItem);
          }

          if($(gridItem).attr('data-height')) {
            item.height = $(gridItem).attr('data-height')*tailleItem;
            $(gridItem).css('height', item.height);
          } else {
            item.height = $(gridItem).height();
            $(gridItem).css('height', tailleItem);
          }


          // Calc nombre collone
          if(item.height > tailleItem) {
            nbCol = Math.round(item.height/tailleItem);
          } else {
            nbCol =1;
          }

          // Calc nombre row

          if(item.width > tailleItem) {
            nbRow = Math.round(item.width/tailleItem);
          } else {
            nbRow = 1;
          }

          // Calc prochaine position accessible
          resultRow = getNextRow(tabArray, nextRow, nextCol, nbRow);

          nextRow = resultRow.nextRow;
          nextCol = resultRow.nextCol;

          if(nextRow+nbRow > col) {
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
              $(data).css({top:tailleItem*col, left:tailleItem*row});
            });


          });

        });

    }



    function getNextRow(tabArray, nextRow, nextCol, nbRow) {

      allPosLibre = false;

      if(nextRow+nbRow > col) {
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

          if(position.row > col) {
            position.row = 0;
            position.col++;
          }

          allPosLibre = true;

          for(addRow= 0; addRow <= nbRow-1; addRow++) {

            position.rowSearch = position.row+addRow;
            position.colSearch = position.col;

            if(position.rowSearch > col) {
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