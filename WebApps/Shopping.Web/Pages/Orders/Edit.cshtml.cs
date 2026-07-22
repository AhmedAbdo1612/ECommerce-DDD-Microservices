using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Shopping.Web.Models.Ordering;
using Shopping.Web.Services;
using AuthorizeAttribute = Microsoft.AspNetCore.Authorization.AuthorizeAttribute;

namespace Shopping.Web.Pages.Orders;

[Authorize(Roles = "Admin,Manager")]
public class EditModel : PageModel
{
    private readonly IOrderingService _orderingService;

    public EditModel(IOrderingService orderingService)
        => _orderingService = orderingService;

    [BindProperty]
    public EditOrderViewModel Order { get; set; } = new();

    public string? ErrorMessage { get; set; }

    // ── GET ──────────────────────────────────────────────────────────────────

    public async Task<IActionResult> OnGetAsync(Guid id)
    {
        try
        {
            var response = await _orderingService.GetOrderById(id);
            var order    = response?.Order;

            if (order is null)
            {
                ErrorMessage = "Order not found.";
                return Page();
            }

            Order = EditOrderViewModel.FromOrderModel(order);
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Error retrieving order: {ex.Message}";
        }

        return Page();
    }

    // ── POST ─────────────────────────────────────────────────────────────────

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid)
            return Page();

        try
        {
            var updatedOrder = Order.ToOrderModel();
            var request      = new UpdateOrderRequest(updatedOrder);
            var response     = await _orderingService.UpdateOrder(request);

            if (response.IsSuccess)
            {
                TempData["SuccessMessage"] = "Order updated successfully.";
                return RedirectToPage("Detail", new { id = Order.Id });
            }

            ErrorMessage = "Failed to update order.";
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Error updating order: {ex.Message}";
        }

        return Page();
    }
}
