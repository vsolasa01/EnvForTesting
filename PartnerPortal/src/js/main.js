/**
 * [description]
 * @param  {[type]} $      [description]
 * @param  {[type]} Chosen [description]
 * @return {[type]}        [description]
 */
var Core = function(args) {

    /**
     *
     *  Private
     *
     */

    //properties
    var _self;

    /**
     *
     *  Public
     *
     */

    var _handleSelectIT = function() {

        $('.dropdown').selectIT();

    };


    var _handleStar = function() {
        $('body').on('touchstart click', '.icon-star', function(event) {
            console.log(12);
            event.stopPropagation();        
            event.preventDefault(); 
            if (event.handled !== true) {
                var proposal = $(this).closest('.proposal');
                $('.proposal').show();
                var newItem = proposal.clone();

                newItem.addClass('starred');
                proposal.hide();
                setTimeout(function() {
                    $('html,body').animate({
                        scrollTop: $('#header').offset().top
                    }, 550);
                }, 5);
                $('.star-wrap').html(newItem);
                event.handled = true;  
            } else {
                return false;
            }



        });
        $('body').on('touchstart click', '.icon-starred', function(event) {
            console.log(5);
            event.stopPropagation();        
            event.preventDefault(); 
            if (event.handled !== true) {
                var proposal = $(this).closest('.proposal');
                $('.proposal').show();
                proposal.hide();
                event.handled = true;  
            } else {
                return false;
            }


        });
    };

    var _handleDetailsOverview = function() {

        $('body').on('touchstart click', '.block.proposal .btn.details-open', function(event) {
            console.log(6);        
            event.stopPropagation();        
            event.preventDefault(); 
            var $this = $(this);     
            if (event.handled !== true) {

                if ($this.closest('.block.proposal').hasClass('open')) {
                    $this.closest('.block.proposal').removeClass('open');
                } else {
                    $this.closest('.block.proposal').addClass('open');
                }         
                event.handled = true;        
            } else {            
                return false;        
            }


        });

    };

    var _handleDelete = function() {

        $('body').on('touchstart click', '.block.proposal .btn.delete-open', function(event) {
            console.log(7);
            event.stopPropagation();        
            event.preventDefault(); 
            var $this = $(this),
                speed = 0;

            if (event.handled !== true) {
                if ($this.closest('.block.proposal').hasClass('open')) {
                    $this.closest('.block.proposal').removeClass('open');
                    speed = 250;
                }

                setTimeout(function() {
                    $this.closest('.block.proposal').toggleClass('delete');
                }, speed);
                event.handled = true;
            } else {
                return false;
            }

        });

        $('body').on('touchstart click', '.delete-confirm .btn', function(event) {
            console.log(8);
            event.stopPropagation();        
            event.preventDefault();
            var $this = $(this);
            if (event.handled !== true) {
                if ($this.hasClass('cancel')) {
                    $this.closest('.block.proposal').removeClass('delete');
                } else {
                    $this.closest('.block.proposal').slideUp('500', function() {
                        $this.closest('.block.proposal').remove();
                    });
                    $('.global-message').addClass('show');
                    _handleglobalMessageBar('proposal');
                }

            } else {
                return false;
            }

        });

    };

    var _handelCustomerNotes = function() {

        $('.content').click(function() {

            var $this = $(this);

            if (!$this.hasClass('upload')) {
                $this.addClass('to-change');
                $this.next('textarea').focus();
            }

        }).blur(function() {
            $('.content.to-change').text($('textarea').val()).removeClass('to-change');
        });

        $('body').keypress(function(e) {

            var $this = $(this);

            if (e.keyCode == 13) {
                $('.content.to-change').text($('textarea').val()).removeClass('to-change');
            }

        });
    };

    var _handleChangeProposalName = function() {

        $('body').on('touchstart click', 'input', function() {
            console.log(9);
            $(this).select();
        });

        $('body').on('touchstart click', '.name-edit', function(event) {
            console.log(10);
            event.stopPropagation();        
            event.preventDefault();
            if (event.handled !== true) {
                if (!$(this).hasClass('to-change')) {
                    $(this).addClass('to-change');
                    $(this).find('input').trigger('click');
                }
                event.handled = true;
            } else {
                return false;
            }

        }).on('blur', '.name-edit', function() {
            console.log(11);
            $('.name-edit.to-change .name').text($('.name-edit.to-change input').val())
            $('.name-edit.to-change').removeClass('to-change');
        });

        $('body').keypress(function(e) {

            var $this = $(this);

            if (e.keyCode == 13) {
                $('.name-edit.to-change .name').text($('.name-edit.to-change input').val())
                $('.name-edit.to-change').removeClass('to-change');
            }

        });


    }

    var _handleDragDropUpload = function() {

        var uploader = document.getElementById('uploader');
        $(uploader).on('dragover', function() {
            console.log(1);
            $(this).parent('.content').addClass('dragover');
        });
        $(uploader).on('drop dragleave dragend', function() {
            console.log(2);
            $(this).parent('.content').removeClass('dragover');
        });
        Dropzone.options.uploader = {
            clickable: '.browse, .upload-icon',
            previewsContainer: '#preview',
            maxThumbnailFilesize: 0.0001,
            uploadprogress: function(file, progress, bytesSent) {
                // Display the progress
                $('.dz-processing .dz-progress .dz-upload').width(progress);

                if (progress == 100) {
                    setTimeout(function() {
                        $('.dz-image').css('opacity', '1')
                            .hover(function() {
                                $('.download-delete-btns').appendTo(this).show();
                            }, function() {
                                $(this).find('.download-delete-btns').hide().find('.delete, .download').show();
                                $(this).find('.download-delete-btns').hide().find('.upload-delete-confirm').addClass('hidden');
                            })
                            .on('click touchstart', '.download-delete-btns:visible .delete', function() {
                                console.log(3);
                                $(this).next('.upload-delete-confirm').removeClass('hidden');
                                $(this).parent('.download-delete-btns').find('.delete, .download').hide();
                            });

                        $('.download-delete-btns .upload-delete-confirm').click(function() {
                            $(this).closest('.dz-preview').hide();
                            $('.global-message').addClass('show');
                            _handleglobalMessageBar('file');

                        });

                        $('.dz-preview.dz-complete .dz-progress').animate({
                            'opacity': '0'
                        }, 500);
                    }, 7300);
                }
            },
            error: function(file) {
                $('.global-message').addClass('show');
                _handleglobalMessageBar('upload');
                setTimeout(function() {
                    $('.dz-complete:not(.dz-processing)').remove();
                }, 0);

            }

        };

    }


    var _handleSideBar = function() {
        $('#sidebar .input input').keyup(function(event) {
            $('.form-submit').css('opacity', '1');
            $(this).css('color', '#e4701e');
        });

        $('#sidebar .input select').change(function() {
            $('.form-submit').css('opacity', '1');
        });


        $('.form-submit .btn').click(function(event) {
            $('.form-submit').css('opacity', '.3');
            $('#sidebar .input input').removeAttr('style');
            $('.selectIT-value').removeClass('changed');
        });

        $('.element .btn.down').click(function() {
            $(this).closest('.area').find('.expandable').animate({
                height: 'toggle',
                opacity: 'toggle'
            }, {
                duration: 500,
                complete: function() {
                    if ($(this).closest('.area').hasClass('open')) {
                        $(this).closest('.area.open').removeClass('open');
                    } else {
                        $(this).closest('.area').addClass('open');
                    }
                }
            });
        });

    };

    var _handleglobalMessageBar = function(type) {

        if (typeof type != 'undefined') {
            switch (type) {
                case 'file':
                    $('.global-message .text').text('File X has been deleted.');
                    break;
                case 'upload':
                    $('.global-message .text').text('File X is too big to upload.');
                    break;
                case 'proposal':
                    $('.global-message .text').text('Proposal X has been deleted.');
                    break;

            }
        }

        $('.global-message .close').click(function(event) {
            $(this).parent().parent('.global-message').removeClass('show');
            $('body').removeClass('global-message-open');
        });

        $('html,body').animate({
            scrollTop: $('#header').offset().top
        }, 550);

        setTimeout(function() {
            $('.global-message').removeClass('show');
            $('body').removeClass('global-message-open');
        }, 10000);

        $('body').addClass('global-message-open');
    };

    var _handleProposalView = function() {
        $('.proposal-btn').click(function(event) {
            if (!$(this).hasClass('active')) {
                $(this).addClass('active');
                $('.agreement-btn').removeClass('active');
                $('.agreement-pdf').hide();
                $('.proposal-pdf').show();
                $('.agreement-inputs').hide();
                $('.proposal-inputs').show();
            }
        });

        $('.agreement-btn').click(function(event) {
            if (!$(this).hasClass('active')) {
                $(this).addClass('active');
                $('.proposal-btn').removeClass('active');
                $('.agreement-pdf').show();
                $('.proposal-pdf').hide();
                $('.agreement-inputs').show();
                $('.proposal-inputs').hide();
            }
        });
    };

    var _handleIframeHeight = function() {
        $('object,iframe').css('height', '160vh');
    };

    var _handelPickEmail = function() {

        $('.agreement-inputs .email-proposal').click(function(event) {
            if ($('.pick-email').hasClass('hidden')) {
                $('.pick-email').removeClass('hidden');
            } else {
                $('.pick-email').addClass('hidden');
            }
        });

        $('#proposal-overview input[type=checkbox]').click(function(event) {
            $(this).toggleClass('checked');
            if ($(this).hasClass('checked')) {
                console.log($(this).closest('.someone-else').find('.input'));
                $(this).closest('.someone-else').find('.input').removeClass('hidden');
                $(this).closest('.someone-else').find('.input input').click();
                _saveBtn();
            } else {
                $(this).closest('.someone-else').find('.input').addClass('hidden');
                $(this).closest().parent().find('.full').removeAttr('style');
                $('body').off('click', '.save_btn');
                $('.pick-email .save_btn').css('opacity', '.3');
            }
        });

        $('#proposal-overview .cancel_btn').click(function(event) {
            $(this).parent().parent().addClass('hidden');
        });

    };

    var _saveBtn = function() {
        $('.pick-email .save_btn').css('opacity', '1');
        $('body').on('click', '.save_btn', function(event) {
            $(this).parent().parent().addClass('hidden');
        });
    }

    var _handlePopup = function() {

        $('.popup .close').click(function(event) {
            $('body').removeClass('popup-open');

        });

        $('.proposal-inputs .preview-inputs').click(function(event) {
            $('body').addClass('popup-open');
        });
    };

    var _handleRadioFinanceTable = function() {
        $('input[type=radio]').change(function() {
            var td = $(this).closest('row');
            var index = td.index();
            var table = $(this).closest('.custom-table');
            table.find('.column').removeClass('active');
            $(this).closest('.column').addClass('active').prev('.column').addClass('prev');
        });

        $('#finance-options .column').click(function(event) {
            $(this).find('input[type=radio]').prop('checked', 'checked').change();
        });

        $('#finance-options .column:not(.active)').hover(function() {
            $(this).prev('.column').addClass('prev');
        }, function() {

            $(this).prev('.column').removeClass('prev');
        });

    };

    var _handleCheckboxesFinanceTable = function() {

        $('.checkfield input[type=checkbox]').click(function() {
            $(this).closest('.checkfield-container').toggleClass('no-price');
        });

    };

    var _handleSaveCancelFinanceOptions = function() {

        $('#finance-options .cancel_btn').click(function() {
            $('.section-back').addClass('save-cancel');
            $('.section-back.save-cancel').animate({
                height: '181px',
            }, {
                duration: 500,
                step: function() {
                    $(this).css('backgroundColor', '#f4a81e');
                },
                complete: function() {
                    $('.section-back.save-cancel .save-cancel-states').fadeIn();
                    $('.section-back.save-cancel .save-cancel-states .cancel-state').fadeIn('400');
                }
            });
        });

        $('#finance-options .dont').click(function() {
            $('.section-back.save-cancel').animate({
                height: '70px'
            }, {
                duration: 500,
                step: function() {
                    $('.section-back.save-cancel .save-cancel-states, .cancel-state').fadeOut('400');
                },
                complete: function() {
                    $(this).css({
                        backgroundColor: '#f2f2f2'
                    });

                    $(this).removeClass('save-cancel');

                    // $('.section-back.save-cancel .save-cancel-states .cancel-state ').fadeOut('200');
                    $('.section-back .save-cancel-states').removeAttr('style');
                    $('.section-back.save-cancel').removeClass('save-cancel');
                    $('.section-back').removeAttr('style');
                }
            });
        });

        $('#finance-options .save').click(function() {
            $('.section-back.save-cancel').animate({
                height: '70px'
            }, {
                duration: 500,
                step: function() {
                    $('.section-back.save-cancel .save-cancel-states .cancel-state').fadeOut('400');
                },
                complete: function() {
                    $('.section-back.save-cancel .save-cancel-states .save-state').fadeIn();
                    $('.section-back.save-cancel .save-cancel-states .save-state .loading').fadeIn('400');
                    $('.section-back.save-cancel').css({
                        'line-height': '70px'
                    }).find('.save-cancel-states').css({
                        'padding-top': 0
                    });
                }
            });

            setTimeout(function() {
                $('.section-back.save-cancel .save-cancel-states .save-state .loading').fadeOut('400', function() {
                    $('.section-back.save-cancel .save-cancel-states .save-state .error').fadeIn('400');
                });
            }, 2800);

            setTimeout(function() {
                $('.section-back.save-cancel .save-cancel-states .save-state .error').fadeOut('400', function() {
                    $('.section-back .save-cancel-states, .section-back.save-cancel .save-cancel-states .save-state .saved ').fadeOut('200');
                    $('.section-back .save-cancel-states').removeAttr('style');
                    $('.section-back.save-cancel').removeClass('save-cancel');
                    $('.section-back').removeAttr('style');
                });
            }, 5200);


        });

        $('#finance-options .save_btn').click(function() {

            $('.section-back').addClass('save-cancel');
            $('.section-back.save-cancel .save-cancel-states,.section-back.save-cancel .save-cancel-states .save-state').fadeIn('400');
            $('.section-back.save-cancel').css('backgroundColor', '#f4a81e');

            $('.section-back.save-cancel .save-cancel-states .save-state .loading').fadeIn('400');
            $('.section-back.save-cancel').css({
                'line-height': '70px'
            }).find('.save-cancel-states').css({
                'padding-top': 0
            });

            setTimeout(function() {
                $('.section-back.save-cancel .save-cancel-states .save-state .loading').fadeOut('400', function() {
                    $('.section-back.save-cancel .save-cancel-states .save-state .saved').fadeIn('400');
                });
            }, 2200);

            setTimeout(function() {
                $('.section-back.save-cancel .save-cancel-states .save-state .saved').fadeOut('400', function() {
                    $('.section-back .save-cancel-states, .section-back.save-cancel .save-cancel-states .save-state .error ').fadeOut('200');
                    $('.section-back .save-cancel-states').removeAttr('style');
                    $('.section-back.save-cancel').removeClass('save-cancel');
                    $('.section-back').removeAttr('style');
                });
            }, 4200);

        });
    };


    return {

        /* ==========================================================================
	        constructor
	        ========================================================================== */

        constructor: function(args) {

            _self = this;

            _self.init();

            return this;

        },

        /* ==========================================================================
	        init
	        ========================================================================== */

        init: function() {
            _handleSelectIT();
            _handleDetailsOverview();
            _handleDelete();
            _handelPickEmail();
            _handleStar();
            _handelCustomerNotes();
            _handleDragDropUpload();
            _handleIframeHeight();
            _handleSideBar();
            _handleChangeProposalName();
            _handleProposalView();
            _handlePopup();
            _handleRadioFinanceTable();
            _handleCheckboxesFinanceTable();
            _handleSaveCancelFinanceOptions();
        }

        /* ==========================================================================
	        public methods
	        ========================================================================== */


        /* ==========================================================================
	        public properties
	        ========================================================================== */


    }.constructor(args);

};

$(document).ready(function() {
    new Core();
});
