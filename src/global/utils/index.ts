import { Request, Response } from "express";


export function successHandler(res: Response, message: string, data: any): any {
    return res.json({
      statusCode: 200,
      status: "success",
      success: true,
      message,
      data,
    });
  }
  
 
  export function errorHandler(
    res: Response,
    message: string,
    code: number = 500,
    error?: any
  ) {
    res.status(code).json({
      statusCode: code,
      status: "error",
      success: false,
      message,
      error: error ? error.message : undefined,
    });
  }
  