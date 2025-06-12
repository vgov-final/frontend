import React from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError();

  const getErrorMessage = () => {
    if (isRouteErrorResponse(error)) {
      return {
        title: `${error.status} ${error.statusText}`,
        message: error.data?.message || 'Trang không tồn tại hoặc có lỗi xảy ra.',
      };
    }

    if (error instanceof Error) {
      return {
        title: 'Lỗi ứng dụng',
        message: error.message,
      };
    }

    return {
      title: 'Lỗi không xác định',
      message: 'Có lỗi không mong muốn xảy ra.',
    };
  };

  const { title, message } = getErrorMessage();

  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-900">{title}</CardTitle>
          <CardDescription className="text-base mt-2">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && error instanceof Error && (
            <div className="p-4 bg-gray-100 rounded text-sm font-mono text-gray-800 overflow-auto max-h-40">
              <div className="font-bold mb-2">Stack trace:</div>
              {error.stack}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={handleGoBack}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <Button 
              onClick={handleGoHome}
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Về trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RouteErrorBoundary;
