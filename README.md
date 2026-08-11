# Kongundu Foods

Kongu Foods – Distribution, Subscription & Delivery Management Platform

Version 2.0

1. Project Overview

Kongu Foods is a modern web-based distribution and subscription management platform designed for businesses that manufacture and distribute fresh batter, traditional rice varieties, millets, flour, pickles, oils, and other grocery products.

The platform digitizes the complete business workflow, enabling administrators to manage products, customers, subscriptions, deliveries, inventory, scheduling, delivery executives, analytics, and business operations from a centralized dashboard.

Customers can browse products, subscribe to recurring deliveries, place one-time orders, manage their subscriptions, and view their order history through a responsive customer portal.

Delivery executives receive assigned deliveries through a dedicated Android APK with integrated navigation, customer information, delivery status updates, and completed delivery history.

The application is designed to minimize manual work, improve delivery efficiency, reduce operational errors, and provide complete visibility into business performance.

2. Project Objectives

The primary objectives of the platform are:

 Digitize the complete order lifecycle.

 Simplify subscription management.

 Improve delivery efficiency.

 Monitor inventory in real time.

 Reduce manual operational work.

 Enable structured delivery scheduling.

 Improve customer satisfaction.

 Increase operational transparency.

 Provide centralized business analytics.

 Build a scalable system for future business expansion.

3. Design Philosophy

The entire application should follow a clean, modern, and premium UI/UX inspired by leading food delivery and grocery platforms while maintaining the Kongu Foods brand identity.

Theme

 Light Theme Only

 No Dark Mode anywhere in the application

Color Palette

The UI should be designed based on the Kongu Foods logo colors.

Primary Colors

 Natural Red

 Traditional Brown

 Fresh Green

 Warm Yellow

Secondary Colors

 White

 Light Cream

 Soft Beige

 Light Gray backgrounds

Buttons

 Red Primary CTA

 Green Success

 Yellow Highlights

 Brown Secondary Actions

Cards

 Rounded Corners

 Soft Shadows

 Clean Borders

 Spacious Layout

Typography

 Plus Jakarta Sans

 Inter

Icons

Minimal outline icons only.

No cartoon illustrations.

4. Visual Assets

The website should use only realistic, professional photography.

Images

Use:

 Fresh idly batter

 Dosa batter

 Ragi batter

 Traditional rice

 Millets

 Grocery products

 Delivery executives

 Manufacturing process

 Packaging

 Delivery vehicles

 Customers receiving products

Do NOT use:

 AI generated artwork

 Cartoon illustrations

 Flat vector illustrations

 3D icon graphics

 Abstract placeholders

Only high-quality realistic images should be used throughout the application.

5. Hero Section

The homepage hero section should immediately communicate freshness, trust, and traditional food quality.

Hero Background

A full-width looping background video should be used.

The provided video asset should:

 autoplay

 mute

 loop continuously

 cover full hero width

 maintain responsiveness across devices

Overlay

Apply a subtle white gradient overlay to improve text readability while preserving the natural colors of the video.

Hero Content

 Main Heading

 Supporting Description

 Explore Products Button

 Subscribe Now Button

The hero should include subtle entrance animations and smooth content transitions.

6. Homepage Flow

The homepage should follow the below sequence:

 Sticky Navigation

 Hero Video Section

 Featured Products (Auto Slider)

 About Kongu Foods

 Product Categories

 Subscription Benefits

 Fresh Manufacturing Process

 Delivery Coverage Areas

 Customer Benefits

 How Subscription Works

 Testimonials Slider (Real implementation without dummy content)

 Business Statistics

 FAQ Accordion

 Contact Section

 Footer

Several content sections such as Featured Products, Testimonials, and Product Categories should automatically transition using smooth carousel animations.

7. Animations

The website should incorporate modern animations while maintaining smooth performance.

Libraries to be used:

 AOS

 Anime.js

 Theatre.js

 Hammer.js

Animation Guidelines

 Scroll reveal animations

 Fade transitions

 Smooth card entrances

 Number counter animations

 Image zoom on hover

 Button ripple effects

 Hero text sequencing

 Auto sliding product sections

 Smooth page transitions

Cursor modifications should not be implemented.

8. Responsive Design

The platform must be fully responsive.

Supported Devices

 Desktop

 Laptop

 Tablet

 Android Mobile

 iPhone

All three user panels must have responsive layouts.

9. User Panels

The platform consists of three independent panels.

Customer Panel

Functions include:

 Registration

 Login

 Product Catalog

 Search Products

 Product Details

 Shopping Cart

 Checkout

 Cash on Delivery

 Order History

 Subscription Management

 Delivery Address Management

 Notifications

 Profile Management

Admin Panel

Functions include:

 Dashboard

 Customer Management

 Product Management

 Subscription Management

 Inventory Management

 Order Management

 Scheduling

 Delivery Executive Management

 Analytics

 Reports

 Notifications

Delivery Executive Panel (Android APK)

Functions include:

 Login

 Today's Assigned Deliveries

 Navigation

 Customer Information

 Call Customer

 Delivery Status Update

 Completed Deliveries

 Pending Deliveries

 Delivery History

10. Customer Portal

Authentication

 Registration

 Login

 Forgot Password

 OTP Verification (Future Ready)

Product Catalog

Customers can:

 Browse Products

 Search Products

 Filter Products

 View Images

 View Price

 View Quantity

 View Availability

Shopping Cart

 Add Products

 Remove Products

 Quantity Update

 Order Summary

Checkout

Checkout should include:

 Delivery Address

 Delivery Slot

 Order Summary

 Cash on Delivery

Only Cash on Delivery should be enabled.

The payment module should be developed in a way that Razorpay integration can be easily added later without structural changes.

Orders

Customers can:

 Place Instant Orders

 View Order Status

 View Invoice

 Order History

Subscription Module

Customers can subscribe:

 Daily

 Weekly

 Alternate Day

 Monthly

Subscription Controls

 Pause

 Resume

 Skip Day

 Change Quantity

 Cancel Subscription

11. Admin Panel

Dashboard Widgets

 Today's Orders

 Pending Orders

 Completed Deliveries

 Active Customers

 Revenue

 Monthly Revenue

 Products Sold

 Subscription Count

 Inventory Status

 Online Delivery Executives

Product Dashboard

Admin can

 Add Product

 Edit Product

 Delete Product

 Upload Images

 Product Pricing

 Stock Quantity

 Product Category

 Featured Product

 Enable or Disable Product

Supported Categories

 Batter

 Rice

 Millets

 Flour

 Oils

 Pickles

 Grocery

Customer Management

 Customer List

 Customer Details

 Address

 Orders

 Subscriptions

 Payment Status

Inventory

 Stock Entry

 Purchase Entry

 Low Stock Alerts

 Stock Deduction

 Inventory History

Subscription Management

 Active

 Paused

 Cancelled

 Renewals

Order Management

 View Orders

 Assign Executive

 Change Status

 Cancel Orders

Scheduling

Admin can configure:

 Morning Delivery

 Evening Delivery

 Area Wise Schedule

 Product Wise Schedule

 Holiday Schedule

 Festival Schedule

Delivery Executive Management

 Add Executive

 Edit Executive

 Delete Executive

 Assign Area

 Assign Orders

 Performance Report

Assignments should always use actual customer orders and delivery executives from the database. The system must not display mock or placeholder assignment data.

Reports

 Daily

 Weekly

 Monthly

 Revenue

 Products

 Customers

 Deliveries

12. Delivery Executive APK

Features

 Secure Login

 Today's Orders

 Customer Details

 Navigation

 Delivery Route

 ETA

 Call Customer

 Delivery Status

 Completed Deliveries

 Pending Deliveries

13. Google Maps Navigation

The delivery executive application shall integrate Google Maps for navigation.

Capabilities include:

 Route Navigation

 Distance

 ETA

 Customer Address

 Start Navigation

 Delivery Status

 Delivery Completion

Administrator Features

 Assign Deliveries

 View Delivery Status

 Delivery Reports

Optional future enhancement:

 Live Executive Tracking

14. Inventory Module

Inventory features include:

 Stock Entry

 Purchase Entry

 Stock Adjustment

 Low Stock Alerts

 Inventory Reports

15. Analytics Dashboard

Revenue Analytics

 Daily Revenue

 Monthly Revenue

 Annual Revenue

Order Analytics

 Daily Orders

 One-Time Orders

 Subscription Orders

Product Analytics

 Top Selling Products

 Low Selling Products

Customer Analytics

 Active Customers

 New Customers

 Returning Customers

Delivery Analytics

 Delivery Success

 Failed Deliveries

 Executive Performance

16. Notification System

Customer

 Order Confirmation

 Subscription Reminder

 Delivery Status

Admin

 Inventory Alerts

 Failed Payments (Future)

 Delivery Delays

Delivery Executive

 Assigned Orders

 Schedule Updates

 New Deliveries

17. Backend Architecture

The application shall use a production-ready backend architecture with a normalized relational database.

Suggested stack:

 Frontend: React

 Backend API: Node.js with Express

 Database: PostgreSQL (or Supabase PostgreSQL)

 Authentication: JWT

 Storage: Object storage for product images

 RESTful APIs with role-based access control

All data shown in the application must come from the backend database. No mock data, placeholder records, or hardcoded business information should be present in development or production.

18. Database Modules

The backend should include structured tables for:

 Users

 Roles

 Customers

 Delivery Executives

 Products

 Product Categories

 Inventory

 Purchases

 Orders

 Order Items

 Subscriptions

 Delivery Assignments

 Delivery Status

 Scheduling

 Notifications

 Reports

 Activity Logs

 Addresses

Relationships should enforce referential integrity, enabling realistic workflows such as assigning actual orders to available delivery executives and updating delivery statuses in real time.

19. Security

 JWT Authentication

 Role-Based Authorization

 Password Encryption

 API Validation

 SQL Injection Protection

 Secure File Upload

 Audit Logging

 Session Management

 HTTPS Support

 Rate Limiting

20. Performance Requirements

 Fast page load times

 Lazy loading of media

 Image optimization

 Responsive rendering

 Optimized API responses

 Pagination for large datasets

 Efficient database indexing

 Smooth animations without UI lag

21. Future Enhancements

The architecture should support future integrations without major redesign, including:

 Razorpay Payment Gateway

 UPI Payments

 Online Wallets

 Live Delivery Tracking for Customers

 Push Notifications

 SMS and WhatsApp Notifications

 Route Optimization

 Multi-Branch Management

 Coupon and Offers Module

 Loyalty Rewards

 Multi-Language Support

 Invoice PDF Generation

 GST Billing

 AI-Based Demand Forecasting

22. Expected Deliverables

 Responsive Customer Website

 Responsive Admin Dashboard

 Android Delivery Executive APK

 Backend APIs

 Production Database

 Authentication System

 Google Maps Integration

 Checkout with Cash on Delivery

 Subscription Management

 Inventory Management

 Order Management

 Analytics Dashboard

 Scheduling Module

 Notification System

 Deployment-Ready Source Code

1. Business Model

Kongu Nadu Fresh Foods operates entirely on a subscription-based delivery model.

Customers cannot place one-time orders.

Every customer must purchase products through a subscription plan.

Supported subscriptions include:

 Daily

 Alternate Day

 Weekly

 Monthly

The system should automatically generate deliveries based on the customer's selected subscription schedule.

2. Product Categories

The platform supports the following categories.

Fresh Batter

 Plain Batter

 Idly Batter

 Dosa Batter

 Ragi Batter

 Millet Batter

Traditional Rice

Products are delivered throughout India.

Examples include:

 Karuppu Kavuni

 Mappillai Samba

 Kattuyanam

 Kichili Samba

 Poongar

 Karunguruvai

 Kaikuthal

 Rathasali

 Aruvatham Kuruvai

 Red Rice

 Thooyamalli

 Moongil Rice

Millets

 Varagu

 Samai

 Thinai

 Kambu

 Cholam

 Panivaragu

 Makka Cholam

 Ragi

 Brown Top

 Nattu Kambu

 Nattu Ragi

Grocery

 Flour

 Oils

 Pickles

 Traditional Products

3. Delivery Coverage

Fresh Batter

Delivery Areas

 Local delivery service only

 Area-wise delivery scheduling

 Morning and Evening delivery slots

Traditional Rice & Grocery Products

Delivery Coverage

 Available across India

 Courier based shipping

 Pincode validation

 Shipping charge configuration

 Estimated delivery days

4. Customer Subscription Workflow

Customer Registration

↓

Address Verification

↓

Choose Subscription Plan

↓

Select Delivery Days

↓

Choose Products

↓

Select Quantity

↓

Upload Building Identification Image

↓

Review Subscription

↓

Cash on Delivery

↓

Subscription Activated

↓

Admin Verification

↓

Delivery Boy Assignment

↓

Scheduled Deliveries Begin

5. Building Identification Image (New Feature)

During subscription checkout, the customer must upload a building identification image.

Purpose

This image helps the assigned delivery executive easily identify the delivery location.

Examples

 House Front View

 Apartment Entrance

 Gate Photo

 Building Name Board

 Nearby Landmark

Image Requirements

Supported Formats

 JPG

 PNG

 WEBP

Maximum Size

 5 MB

Storage

The uploaded image shall be securely stored in the backend database and displayed only to the assigned delivery executive and administrator.

Privacy

The building image must never be visible to other customers.

6. Location Privacy

Customer Privacy

Customer location should remain private.

Only the assigned delivery executive can access:

 Delivery Address

 Google Maps Navigation

 Building Identification Image

 Contact Number

The customer portal shall not display the delivery executive's live location.

The administrator may optionally view delivery progress for operational purposes.

7. Delivery Assignment Workflow

The administrator is solely responsible for assigning deliveries.

Workflow

Customer Subscription

↓

Subscription Approved

↓

Delivery Generated

↓

Admin Dashboard

↓

Select Delivery Executive

↓

Assign Delivery

↓

Delivery Executive Receives Notification

↓

Delivery Executive Starts Navigation

↓

Delivery Completed

↓

Status Updated Automatically

There should be no automatic assignment of delivery executives.

Assignments must use actual customer records and active delivery executives from the database.

No mock or placeholder assignments should exist.

8. Customer Checkout

Checkout includes

 Delivery Address

 Delivery Schedule

 Subscription Summary

 Building Identification Image Upload

 Order Notes

 Cash on Delivery

Only Cash on Delivery shall be available.

The checkout architecture should allow future Razorpay integration without requiring structural modifications.

9. Customer Dashboard

Customers can view

 Active Subscription

 Upcoming Deliveries

 Delivery Schedule

 Products Included

 Billing Summary

 Subscription Status

 Delivery Address

 Building Image

 Notifications

Customers cannot

 Track Delivery Executive Live Location

 Modify Assigned Delivery Executive

 View Other Customers

10. Delivery Executive Dashboard

Delivery executives can view

 Assigned Deliveries

 Customer Name

 Contact Number

 Delivery Address

 Building Identification Image

 Google Maps Navigation

 Today's Schedule

 Completed Deliveries

 Pending Deliveries

The application shall provide a one-tap navigation button.

11. Admin Dashboard

The administrator can

 Add Customers

 Manage Products

 Configure Subscription Plans

 Manage Inventory

 Generate Delivery Schedule

 Assign Delivery Executive

 View Delivery Reports

 Monitor Subscription Status

 Manage Delivery Areas

 Configure Delivery Slots

 Upload Product Images

 Configure Rice Shipping Charges

 Configure Batter Delivery Areas

12. Homepage UI/UX Requirements

The website should follow the attached Kongu Nadu branding.

Theme

 Logo-based color palette

 Green

 Brown

 Golden Yellow

 White

 Cream background

No dark mode.

Hero Section

The supplied manufacturing/product video should play automatically.

Requirements

 Loop continuously

 Muted

 Autoplay

 Full-width background

 Responsive

Overlay

Soft white gradient overlay.

13. Realistic Photography

Use only authentic photography similar to the uploaded references.

Include

 Batter preparation

 Traditional rice

 Millets

 Packaging

 Delivery personnel

 Customers receiving deliveries

 Manufacturing process

 Product close-ups

 Farm imagery

Do not use

 AI-generated artwork

 Cartoon illustrations

 Flat icons as hero visuals

 3D illustrations

14. Auto-Sliding Sections

The homepage should automatically transition in selected sections.

Examples

 Hero banners

 Featured Products

 Subscription Plans

 Customer Reviews

 Product Categories

 Manufacturing Gallery

 Traditional Rice Collection

Auto transitions should pause when the user interacts with the content.

15. Animation Requirements

Use modern animations while maintaining excellent performance.

Libraries

 AOS

 Anime.js

 Theatre.js

 Hammer.js

Animations

 Scroll reveal

 Card animations

 Image zoom

 Section transitions

 Statistics counter

 Smooth page transitions

 Auto carousel

 Floating product cards

 Button hover animations

Do not modify the cursor.

16. Backend Database

Production-ready relational database tables should include:

 Users

 Roles

 Customers

 Delivery Executives

 Products

 Product Categories

 Product Images

 Subscription Plans

 Customer Subscriptions

 Subscription Delivery Days

 Orders

 Delivery Assignments

 Delivery Routes

 Delivery Status

 Customer Addresses

 Building Images

 Inventory

 Purchase Entries

 Notifications

 Reports

 Activity Logs

 Delivery Slots

 Service Areas

 Shipping Charges

 Payment Records (COD ready, Razorpay-ready)

All screens must retrieve data from the backend. The application should not contain mock data, placeholder content, or hardcoded assignments. Every customer, product, subscription, and delivery assignment must reflect actual database records.

17. Technical Stack

Frontend

 React

 TypeScript

 Tailwind CSS

 TanStack Router

Backend

 Node.js

 Express.js

Database

 PostgreSQL (Supabase)

Authentication

 JWT

 Role-Based Access Control

Storage

 Product Images

 Customer Building Images

 Documents

Maps

 Google Maps Platform (Delivery Executive only)

18. Deliverables

The final system should include:

 Responsive Customer Web Portal

 Responsive Admin Dashboard

 Android Delivery Executive APK

 Production Backend APIs

 PostgreSQL Database

 Google Maps Integration (Delivery Executive only)

 Cash on Delivery Checkout

 Subscription Management

 Inventory Management

 Delivery Assignment Module

 Analytics Dashboard

 Notification System

 Scheduling Module

 Product Management

 Traditional Rice Shipping Module (Pan India)

 Building Identification Image Upload

 Deployment-Ready Source Code

attached 1st image is the logo
attached video is the backgroudn video to be playen on loop
attached 2nd and third image is the section structure to be and played in auto next mode and even manual change can also e processed
section wich contain contents and one side image that needs to eb equal with the content

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://kongu-roots-delivery.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3cd2c605-9791-498b-af74-17b81e686ed7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
