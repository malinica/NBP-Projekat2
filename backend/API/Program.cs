using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddScoped<UserService, UserService>();
builder.Services.AddScoped<TokenService, TokenService>();
builder.Services.AddScoped<ProjectService, ProjectService>();
builder.Services.AddScoped<ReviewService, ReviewService>();
builder.Services.AddScoped<TagService, TagService>();

builder.Services.AddControllers().AddJsonOptions(opt =>
{
    opt.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddSwaggerGen(c =>
{ //<-- NOTE 'Add' instead of 'Configure'
    c.SwaggerDoc("v3", new OpenApiInfo
    {
        Title = "API",
        Version = "v3"
    });
});

var validIssuer = builder.Configuration.GetValue<string>("JwtTokenSettings:ValidIssuer");
var validAudience = builder.Configuration.GetValue<string>("JwtTokenSettings:ValidAudience");
var symmetricSecurityKey = builder.Configuration.GetValue<string>("JwtTokenSettings:SymmetricSecurityKey");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(options =>
    {
        options.IncludeErrorDetails = true;
        options.TokenValidationParameters = new TokenValidationParameters()
        {
            ClockSkew = TimeSpan.Zero,
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = validIssuer,
            ValidAudience = validAudience,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(symmetricSecurityKey!)
            ),
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("CORS", policy =>
    {
        policy.AllowAnyHeader()
              .AllowAnyMethod()
              // .AllowAnyOrigin()
              .WithOrigins("http://127.0.0.1:5173",
                           "https://127.0.0.1:5173",
                           "http://localhost:5173",
                           "https://localhost:5173");

    });
});

var app = builder.Build();

var parentFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
var childFolder = Path.Combine(parentFolder, "ProjectsImages");
if (!Directory.Exists(parentFolder))
{
    Directory.CreateDirectory(parentFolder);
}
if (!Directory.Exists(childFolder))
{
    Directory.CreateDirectory(childFolder);
}


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "API");
    });
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("CORS");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
