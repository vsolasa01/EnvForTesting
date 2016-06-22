
 //Near checkboxes
$('.finance_option').click(function() {
    $(this).siblings('input:checkbox').prop('checked', false);
});