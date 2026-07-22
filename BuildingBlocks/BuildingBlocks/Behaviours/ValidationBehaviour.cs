using FluentValidation;
using MediatR;

namespace BuildingBlocks.Behaviours
{
    /// <summary>
    /// MediatR pipeline behaviour that runs all registered FluentValidation
    /// validators for a request before the handler is called.
    ///
    /// Previously constrained to <c>ICommand&lt;TResponse&gt;</c> which silently
    /// skipped validation on queries. Now uses <c>IRequest&lt;TResponse&gt;</c>
    /// (the common MediatR base) so both commands and queries are validated.
    /// </summary>
    public class ValidationBehaviour<TRequest, TResponse>(IEnumerable<IValidator<TRequest>> validators)
        : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            if (!validators.Any())
                return await next();

            var context           = new ValidationContext<TRequest>(request);
            var validationResults = await Task.WhenAll(
                validators.Select(v => v.ValidateAsync(context, cancellationToken)));

            var failures = validationResults
                .Where(r => r.Errors.Any())
                .SelectMany(r => r.Errors)
                .ToList();

            if (failures.Any())
                throw new ValidationException(failures);

            return await next();
        }
    }
}
