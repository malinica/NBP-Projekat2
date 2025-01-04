using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddScoped<UserService, UserService>();

builder.Services.AddControllers().AddJsonOptions(opt =>
{
    opt.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddSwaggerGen(c => { //<-- NOTE 'Add' instead of 'Configure'
    c.SwaggerDoc("v3", new OpenApiInfo {
        Title = "API",
        Version = "v3"
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("CORS", policy =>
    {
        policy.AllowAnyHeader()
              .AllowAnyMethod()
            //   .AllowAnyOrigin()
              .WithOrigins("http://127.0.0.1:5173",
                           "https://127.0.0.1:5173",
                           "http://localhost:5173",
                           "https://localhost:5173");

    });
});

var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(options => {
        options.SwaggerEndpoint("/openapi/v1.json","API");
    });
}

app.UseHttpsRedirection();
// app.UseStaticFiles();
app.UseCors("CORS");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
