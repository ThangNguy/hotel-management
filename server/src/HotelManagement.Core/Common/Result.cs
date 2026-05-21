namespace HotelManagement.Core.Common;

/// <summary>
/// A centralized result class for handling success and failure states across the application layers.
/// This prevents throwing exceptions for expected control flow like validation failures or not found.
/// </summary>
public class Result<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public string? Error { get; }
    public ResultErrorType ErrorType { get; }

    private Result(bool isSuccess, T? value, string? error, ResultErrorType errorType)
    {
        IsSuccess = isSuccess;
        Value = value;
        Error = error;
        ErrorType = errorType;
    }

    public static Result<T> Success(T value) 
        => new Result<T>(true, value, null, ResultErrorType.None);

    public static Result<T> Failure(string error, ResultErrorType errorType = ResultErrorType.BadRequest) 
        => new Result<T>(false, default, error, errorType);
        
    public static Result<T> NotFound(string error) 
        => new Result<T>(false, default, error, ResultErrorType.NotFound);
        
    public static Result<T> Unauthorized(string error) 
        => new Result<T>(false, default, error, ResultErrorType.Unauthorized);
}

public enum ResultErrorType
{
    None,
    BadRequest,
    NotFound,
    Unauthorized,
    Conflict,
    InternalError
}
