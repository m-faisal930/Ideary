export interface GeneratedBlogData {
  title: string;
  
  description: string;
  
  content: string;
  
  tags: string[];
}

export interface GenerateBlogRequest {

  prompt: string;
}


export interface GenerateBlogError {

  message: string;
  

  details?: string;
}


export interface GenerateBlogModalProps {

  isOpen: boolean;
  

  onClose: () => void;
  

  onGenerate: (data: GeneratedBlogData) => void;
}
