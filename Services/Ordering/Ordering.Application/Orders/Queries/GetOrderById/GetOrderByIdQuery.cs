using System;
using System.Collections.Generic;
using System.Text;

namespace Ordering.Application.Orders.Queries.GetOrderById;

public record GetOrderByIdResult(OrderDto? Order);

public record GetOrderByIdQuery(Guid Id) : IQuery<GetOrderByIdResult>;

