using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Shopping.Web.Pages
{
    public class ConfirmationModel : PageModel
    {
        public string Message { get; set; } = "Your order was submitted successfully!";

        public void OnGet()
        {
        }

        public void OnGetOrderSubmitted()
        {
            Message = "Your order was submitted successfully!";
        }
    }
}
