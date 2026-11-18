FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY HotelManagement.Domain/HotelManagement.Domain.csproj HotelManagement.Domain/
COPY HotelManagement.Application/HotelManagement.Application.csproj HotelManagement.Application/
COPY HotelManagement.Infrastructure/HotelManagement.Infrastructure.csproj HotelManagement.Infrastructure/
COPY HotelManagement.API/HotelManagement.API.csproj HotelManagement.API/
RUN dotnet restore HotelManagement.API/HotelManagement.API.csproj

COPY HotelManagement.Domain/ HotelManagement.Domain/
COPY HotelManagement.Application/ HotelManagement.Application/
COPY HotelManagement.Infrastructure/ HotelManagement.Infrastructure/
COPY HotelManagement.API/ HotelManagement.API/
RUN dotnet publish HotelManagement.API/HotelManagement.API.csproj -c Release -o /app/publish --no-restore /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
COPY --from=build /app/publish .
USER $APP_UID
ENTRYPOINT ["dotnet", "HotelManagement.API.dll"]
