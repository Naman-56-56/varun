from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .gemini_service import gemini_service

class ChatbotQueryView(APIView):
    def post(self, request):
        query = request.data.get("query", "").strip()
        if not query:
            return Response({"error": "Query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        context_params = request.data.get("context", {})
        result = gemini_service.answer_query(query, context_params)
        return Response(result, status=status.HTTP_200_OK)
