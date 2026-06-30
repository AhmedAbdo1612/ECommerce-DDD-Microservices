namespace OrderingDomain.Events;

public record OrderUpdateEvent(Order order) : IDomainEvent;
