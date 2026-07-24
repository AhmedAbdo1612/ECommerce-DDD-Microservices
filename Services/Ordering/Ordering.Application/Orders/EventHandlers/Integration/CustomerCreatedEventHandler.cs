using Mapster;
using System;
using System.Collections.Generic;
using System.Text;

namespace Ordering.Application.Orders.EventHandlers.Integration;

public class CustomerCreatedEventHandler(ISender sender, ILogger<CustomerCreatedEventHandler> logger) : IConsumer<CustomerCreatedEvent>
{
    public async Task Consume(ConsumeContext<CustomerCreatedEvent> context)
    {
        logger.LogInformation("firing the customer create event");
        logger.LogInformation(context.Message.Adapt<CustomerCreatedEvent>().Email);
        await sender.Send(context.Message.Adapt<CustomerCreatedEvent>());
    }
}
