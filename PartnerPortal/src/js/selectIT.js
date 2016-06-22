jQuery.fn.extend({

    selectIT: function() {

        $(this).each(function() {

            // Cache the number of options
            var $this = $(this),
                numberOfOptions = $(this).children('option').length;

            // Hides the select element
            $this.hide();

            // Wrap the select element in a div
            $this.wrap('<div class="selectIT-container"></div>');

            // Insert a styled div to sit over the top of the hidden select element
            $this.after('<div class="selectIT-value"></div>');

            // Cache the styled div
            var $selectIT_value = $this.next('div.selectIT-value');

            // Show the first select option in the styled div
            $selectIT_value.append('<span class="text"/>');
            // $selectIT_value.data('value', $this.data('placeholder')).find('.text').text($this.data('placeholder'));
            $selectIT_value.find('.text').text($this.find('option:selected').text());
            $selectIT_value.append('<span class="arrow arrow-down"/>');

            // Insert an unordered list after the styled div and also cache the list
            var $list = $('<ul />', {
                'class': 'selectIT-dropdown-container'
            }).insertAfter($selectIT_value);

            // Insert a list item into the unordered list for each select option
            for (var i = 0; i < numberOfOptions; i++) {
                $('<li />', {
                    text: $this.children('option').eq(i).text(),
                    rel: $this.children('option').eq(i).val()
                }).appendTo($list);
            }

            // Cache the list items
            var $listItems = $list.children('li');

            // Show the unordered list when the styled div is clicked (also hides it if the div is clicked again)
            $selectIT_value
                .click(function(e) {
                    e.stopPropagation();
                    $('ul.selectIT-dropdown-container').hide();
                    $('div.selectIT-value').find('.arrow').removeClass('arrow-up');
                    $('div.styledSelect.active').each(function() {
                        $(this).removeClass('active').next('ul.selectIT-dropdown-container').hide();
                    });
                    $(this).toggleClass('active').next('ul.selectIT-dropdown-container').toggle();
                    $(this).find('.arrow').toggleClass('arrow-up');
                });
            $selectIT_value.parent().mouseleave(function(event) {
                $('ul.selectIT-dropdown-container').hide();
                $('div.selectIT-value').find('.arrow').removeClass('arrow-up');
            });
            // Hides the unordered list when a list item is clicked and updates the styled div to show the selected list item
            // Updates the select element to have the value of the equivalent option
            $listItems.click(function(e) {
                e.stopPropagation();
                $selectIT_value.removeClass('active').addClass('changed').find('.text').text($(this).text());
                $selectIT_value.find('.arrow').removeClass('arrow-up');
                $this.val($(this).attr('rel'));
                var index = $listItems.index($(this));
                $selectIT_value.parent('.selectIT-container').find('select option').removeProp('selected');
                $selectIT_value.parent('.selectIT-container').find('select option').eq(index).prop('selected', 'selected').change();
                $list.hide();
                /* alert($this.val()); Uncomment this for demonstration! */
            });

            // Hides the unordered list when clicking outside of it
            $(document).click(function() {
                $selectIT_value.removeClass('active');
                $list.hide();
            });

        });
    }
});
