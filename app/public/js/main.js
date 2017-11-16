$(document).ready(function(){
    $('.delete-invoice').on('click', function(e){
        $target = $(e.target);
        const id = $target.attr('data-id');
        $.ajax({
            type:'DELETE',
            url: '/invoices/'+id,
            success: function(response){
                alert('Deleting Invoice');
                window.location.href='/invoices';
            },
            error: function(err){
                console.log(err);
            }
        });
    });
});

$(document).ready(function(){
    $('.approve-company').on('click', function(e){
        $target = $(e.target);
        const id = $target.attr('data-id');
        $.ajax({
            type:'GET',
            url: '/companys/approve/'+id,
            success: function(response){
                alert('Company Invoice');
                window.location.href='/companys';
            },
            error: function(err){
                console.log(err);
            }
        });
    });
});